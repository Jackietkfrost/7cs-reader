import { app } from "electron"
import { spawn } from "child_process"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import * as crypto from "crypto"

export interface LocalTtsVoice {
    id: string
    name: string
    lang: string
    engine: "system-native" | "rhvoice"
}

export interface LocalTtsStatus {
    systemNativeAvailable: boolean
    systemNativeLabel: string
    rhvoiceAvailable: boolean
    rhvoiceMode: "sapi5" | "cli" | "none"
    rhvoiceResolvedPath: string
    platform: string
    platformLabel: string
    systemLocale: string
    recommendedRhvoiceUrl: string
    recommendedRhvoiceLanguageLabel: string
}

export interface SynthesizeRequest {
    text: string
    engine: "system-native" | "rhvoice"
    voice?: string
    rate?: number
    pitch?: number
    rhvoicePath?: string
}

export interface SynthesizeResponse {
    audioBase64?: string
    mimeType?: string
    error?: string
}

const RHVOICE_LANGUAGE_PAGES: Record<string, { slug: string; label: string }> = {
    hr: { slug: "hr-voices", label: "Croatian" },
    cs: { slug: "cs-voices", label: "Czech" },
    en: { slug: "en-voices", label: "English" },
    eo: { slug: "eo-voices", label: "Esperanto" },
    ka: { slug: "ka-voices", label: "Georgian" },
    ky: { slug: "ky-voices", label: "Kyrgyz" },
    lb: { slug: "lb-voices", label: "Luxembourgish" },
    mk: { slug: "mk-voices", label: "Macedonian" },
    ro: { slug: "ro-voices", label: "Romanian" },
    ru: { slug: "ru-voices", label: "Russian" },
    sr: { slug: "sr-voices", label: "Serbian" },
    es: { slug: "es-voices", label: "Spanish" },
    tt: { slug: "ta-voices", label: "Tatar" },
    uk: { slug: "uk-voices", label: "Ukrainian" },
    uz: { slug: "uz-voices", label: "Uzbek" }
}

export function detectSystemLocale(preferredLocale?: string): string {
    const candidate =
        preferredLocale?.trim() ||
        app.getLocale?.() ||
        Intl.DateTimeFormat().resolvedOptions().locale ||
        "en-US"
    return candidate.replace("_", "-")
}

export function resolveRhvoiceLanguageGuide(locale: string): {
    url: string
    languageLabel: string
} {
    const baseLang = locale.toLowerCase().split(/[-_]/)[0]
    const matched = RHVOICE_LANGUAGE_PAGES[baseLang]
    if (matched) {
        return {
            url: `https://rhvoice.org/${matched.slug}/`,
            languageLabel: matched.label
        }
    }
    return {
        url: "https://rhvoice.org/languages/",
        languageLabel: "All Languages"
    }
}

function getPlatformLabel(): string {
    if (process.platform === "win32") return "Windows"
    if (process.platform === "darwin") return "macOS"
    return "Linux"
}

interface ProcessResult {
    code: number
    stdout: Buffer
    stderr: string
}

function runProcess(
    command: string,
    args: string[],
    options: {
        stdinText?: string
        env?: Record<string, string | undefined>
        timeoutMs?: number
    } = {}
): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            windowsHide: true,
            env: options.env ? { ...process.env, ...options.env } : process.env
        })

        const stdoutChunks: Buffer[] = []
        const stderrChunks: Buffer[] = []
        let finished = false

        const timeout = setTimeout(() => {
            if (!finished) {
                finished = true
                child.kill()
                reject(new Error(`TTS process timed out after ${options.timeoutMs ?? 20000}ms`))
            }
        }, options.timeoutMs ?? 20000)

        child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk))
        child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk))

        child.on("error", (error) => {
            if (!finished) {
                finished = true
                clearTimeout(timeout)
                reject(error)
            }
        })

        child.on("close", (code) => {
            if (!finished) {
                finished = true
                clearTimeout(timeout)
                resolve({
                    code: code ?? 1,
                    stdout: Buffer.concat(stdoutChunks),
                    stderr: Buffer.concat(stderrChunks).toString("utf8").trim()
                })
            }
        })

        if (options.stdinText !== undefined) {
            child.stdin.write(options.stdinText, "utf8")
        }
        child.stdin.end()
    })
}

function findExecutableOnPath(names: string[]): string {
    const pathEnv = process.env.PATH || ""
    const dirs = pathEnv.split(path.delimiter).filter(Boolean)
    const extensions = process.platform === "win32" ? ["", ".exe", ".cmd", ".bat"] : [""]

    for (const dir of dirs) {
        for (const name of names) {
            for (const ext of extensions) {
                const candidate = path.join(dir, name.endsWith(ext) ? name : `${name}${ext}`)
                if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                    return candidate
                }
            }
        }
    }
    return ""
}

export function resolveRhvoiceBinary(customPath?: string): string {
    const trimmed = customPath?.trim()
    if (trimmed && fs.existsSync(trimmed) && fs.statSync(trimmed).isFile()) {
        return trimmed
    }

    const onPath = findExecutableOnPath(["RHVoice-test", "rhvoice-test", "RHVoice-client"])
    if (onPath) {
        return onPath
    }

    const commonCandidates =
        process.platform === "win32"
            ? [
                  "C:\\Program Files\\RHVoice\\bin\\RHVoice-test.exe",
                  "C:\\Program Files\\RHVoice\\RHVoice-test.exe",
                  "C:\\Program Files (x86)\\RHVoice\\bin\\RHVoice-test.exe",
                  "C:\\Program Files (x86)\\RHVoice\\RHVoice-test.exe"
              ]
            : [
                  "/usr/bin/RHVoice-test",
                  "/usr/local/bin/RHVoice-test",
                  "/opt/homebrew/bin/RHVoice-test"
              ]

    for (const candidate of commonCandidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate
        }
    }

    return ""
}

function resolveLinuxNativeBinary(): string {
    return findExecutableOnPath(["espeak-ng", "espeak"])
}

function getSysWow64PowerShellPath(): string {
    const systemRoot = process.env.SystemRoot || "C:\\Windows"
    const candidate = path.join(
        systemRoot,
        "SysWOW64",
        "WindowsPowerShell",
        "v1.0",
        "powershell.exe"
    )
    return fs.existsSync(candidate) ? candidate : ""
}

async function queryWindowsComSapiRhvoices(powershellExe: string): Promise<LocalTtsVoice[]> {
    const script = [
        "$ErrorActionPreference = 'SilentlyContinue'",
        "$voices = @()",
        "try {",
        "  $sp = New-Object -ComObject SAPI.SpVoice",
        "  foreach ($v in $sp.GetVoices()) {",
        "    $id = [string]$v.Id",
        "    $desc = [string]$v.GetDescription()",
        "    $vendor = ''",
        "    try { $vendor = [string]$v.GetAttribute('Vendor') } catch {}",
        "    if (($id + ' ' + $desc + ' ' + $vendor) -match 'RHVoice|Olga\\s+Yakovleva') {",
        "      $lang = ''",
        "      try {",
        "        $hex = ([string]$v.GetAttribute('Language')).Split(';')[0].Trim()",
        "        if ($hex) { $lang = [System.Globalization.CultureInfo]::GetCultureInfo([Convert]::ToInt32($hex, 16)).Name }",
        "      } catch {}",
        "      $voices += [PSCustomObject]@{ id = $desc; name = $desc; lang = $lang }",
        "    }",
        "  }",
        "} catch {}",
        "$voices | ConvertTo-Json -Compress"
    ].join("\n")

    try {
        const result = await runProcess(powershellExe, [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            script
        ])
        const raw = result.stdout.toString("utf8").trim()
        if (!raw) {
            return []
        }
        const parsed = JSON.parse(raw)
        const list = Array.isArray(parsed) ? parsed : [parsed]
        return list
            .filter((item) => item && item.name)
            .map((item) => ({
                id: String(item.id || item.name),
                name: String(item.name),
                lang: String(item.lang || ""),
                engine: "rhvoice" as const
            }))
    } catch {
        return []
    }
}

async function listWindowsRhvoiceSapiVoices(): Promise<LocalTtsVoice[]> {
    if (process.platform !== "win32") {
        return []
    }
    const voices64 = await queryWindowsComSapiRhvoices("powershell.exe")
    if (voices64.length > 0) {
        return voices64
    }
    const ps32 = getSysWow64PowerShellPath()
    if (ps32) {
        return queryWindowsComSapiRhvoices(ps32)
    }
    return []
}

export async function getLocalTtsStatus(
    customRhvoicePath?: string,
    preferredLocale?: string
): Promise<LocalTtsStatus> {
    const systemLocale = detectSystemLocale(preferredLocale)
    const guide = resolveRhvoiceLanguageGuide(systemLocale)
    const platformLabel = getPlatformLabel()

    const sapiRhvoices = process.platform === "win32" ? await listWindowsRhvoiceSapiVoices() : []
    const rhvoiceResolvedPath = resolveRhvoiceBinary(customRhvoicePath)

    let rhvoiceMode: "sapi5" | "cli" | "none" = "none"
    if (sapiRhvoices.length > 0) {
        rhvoiceMode = "sapi5"
    } else if (rhvoiceResolvedPath) {
        rhvoiceMode = "cli"
    }

    const common = {
        rhvoiceAvailable: rhvoiceMode !== "none",
        rhvoiceMode,
        rhvoiceResolvedPath,
        platform: process.platform,
        platformLabel,
        systemLocale,
        recommendedRhvoiceUrl: guide.url,
        recommendedRhvoiceLanguageLabel: guide.languageLabel
    }

    if (process.platform === "win32") {
        return {
            systemNativeAvailable: true,
            systemNativeLabel: "Windows OneCore / SAPI (Offline)",
            ...common
        }
    }

    if (process.platform === "darwin") {
        return {
            systemNativeAvailable: true,
            systemNativeLabel: "macOS Native Speech (Offline)",
            ...common
        }
    }

    const linuxBin = resolveLinuxNativeBinary()
    return {
        systemNativeAvailable: Boolean(linuxBin),
        systemNativeLabel: linuxBin ? `Linux ${path.basename(linuxBin)} (Offline)` : "Unavailable",
        ...common
    }
}

async function listWindowsVoices(): Promise<LocalTtsVoice[]> {
    const script = [
        "$ErrorActionPreference = 'SilentlyContinue'",
        "$voices = @()",
        "try {",
        "  [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType=WindowsRuntime] | Out-Null",
        "  foreach ($v in [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices) {",
        "    $voices += [PSCustomObject]@{ id = $v.DisplayName; name = $v.DisplayName; lang = $v.Language }",
        "  }",
        "} catch {}",
        "if ($voices.Count -eq 0) {",
        "  try {",
        "    Add-Type -AssemblyName System.Speech",
        "    $s = New-Object System.Speech.Synthesis.SpeechSynthesizer",
        "    foreach ($v in $s.GetInstalledVoices()) {",
        "      $voices += [PSCustomObject]@{ id = $v.VoiceInfo.Name; name = $v.VoiceInfo.Name; lang = $v.VoiceInfo.Culture.Name }",
        "    }",
        "    $s.Dispose()",
        "  } catch {}",
        "}",
        "$voices | ConvertTo-Json -Compress"
    ].join("\n")

    try {
        const result = await runProcess("powershell.exe", [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            script
        ])
        const raw = result.stdout.toString("utf8").trim()
        if (!raw) {
            return []
        }
        const parsed = JSON.parse(raw)
        const list = Array.isArray(parsed) ? parsed : [parsed]
        return list
            .filter((item) => item && item.name)
            .map((item) => ({
                id: String(item.id || item.name),
                name: String(item.name),
                lang: String(item.lang || "en-US"),
                engine: "system-native" as const
            }))
    } catch (error) {
        console.error("Failed to list Windows native voices:", error)
        return []
    }
}

async function listMacVoices(): Promise<LocalTtsVoice[]> {
    try {
        const result = await runProcess("say", ["-v", "?"])
        const lines = result.stdout.toString("utf8").split(/\r?\n/)
        const voices: LocalTtsVoice[] = []
        for (const line of lines) {
            const match = line.match(/^(.+?)\s+([a-z]{2,3}[_-][A-Za-z0-9]+)\s+#/)
            if (match) {
                const name = match[1].trim()
                const lang = match[2].replace("_", "-")
                voices.push({ id: name, name, lang, engine: "system-native" })
            }
        }
        return voices
    } catch {
        return []
    }
}

async function listLinuxVoices(): Promise<LocalTtsVoice[]> {
    const bin = resolveLinuxNativeBinary()
    if (!bin) {
        return []
    }
    try {
        const result = await runProcess(bin, ["--voices"])
        const lines = result.stdout.toString("utf8").split(/\r?\n/).slice(1)
        const voices: LocalTtsVoice[] = []
        for (const line of lines) {
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 4) {
                voices.push({
                    id: parts[1],
                    name: parts[3],
                    lang: parts[1],
                    engine: "system-native"
                })
            }
        }
        return voices
    } catch {
        return []
    }
}

function listRhvoiceCliVoices(customRhvoicePath?: string): LocalTtsVoice[] {
    const resolvedBin = resolveRhvoiceBinary(customRhvoicePath)
    const searchDirs: string[] = []

    if (resolvedBin) {
        const binDir = path.dirname(resolvedBin)
        searchDirs.push(path.join(binDir, "voices"))
        searchDirs.push(path.join(path.dirname(binDir), "voices"))
        searchDirs.push(path.join(path.dirname(binDir), "data", "voices"))
    }

    if (process.platform === "win32") {
        if (process.env.ProgramData) {
            searchDirs.push(path.join(process.env.ProgramData, "RHVoice", "voices"))
        }
        if (process.env.APPDATA) {
            searchDirs.push(path.join(process.env.APPDATA, "RHVoice", "voices"))
        }
    } else {
        searchDirs.push(
            "/usr/share/RHVoice/voices",
            "/usr/local/share/RHVoice/voices",
            path.join(os.homedir(), ".local", "share", "RHVoice", "voices")
        )
    }

    const discovered = new Map<string, LocalTtsVoice>()
    for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) {
            continue
        }
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
                if (!entry.isDirectory()) {
                    continue
                }
                const voiceName = entry.name
                const infoPath = path.join(dir, voiceName, "voice.info")
                let displayName = voiceName
                let lang = "en"
                if (fs.existsSync(infoPath)) {
                    const info = fs.readFileSync(infoPath, "utf8")
                    const nameMatch = info.match(/^name\s*=\s*(.+)$/im)
                    const langMatch = info.match(/^language\s*=\s*(.+)$/im)
                    if (nameMatch) displayName = nameMatch[1].trim()
                    if (langMatch) lang = langMatch[1].trim()
                }
                discovered.set(displayName.toLowerCase(), {
                    id: displayName,
                    name: `${displayName} (${lang})`,
                    lang,
                    engine: "rhvoice"
                })
            }
        } catch {
            // Skip unreadable candidate directories
        }
    }

    return Array.from(discovered.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function listLocalTtsVoices(
    engine: "system-native" | "rhvoice",
    customRhvoicePath?: string
): Promise<LocalTtsVoice[]> {
    if (engine === "rhvoice") {
        if (process.platform === "win32") {
            const sapiVoices = await listWindowsRhvoiceSapiVoices()
            if (sapiVoices.length > 0) {
                return sapiVoices
            }
        }
        return listRhvoiceCliVoices(customRhvoicePath)
    }

    if (process.platform === "win32") {
        return listWindowsVoices()
    }
    if (process.platform === "darwin") {
        return listMacVoices()
    }
    return listLinuxVoices()
}

function createTempWavPath(): string {
    const id = crypto.randomBytes(8).toString("hex")
    return path.join(os.tmpdir(), `7cs-tts-${id}.wav`)
}

function removeFileQuietly(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    } catch {
        // Ignore temp file cleanup errors
    }
}

async function runWindowsComSapiSynthesis(
    powershellExe: string,
    text: string,
    voice: string,
    rate: number,
    pitch: number,
    requireRhvoice: boolean
): Promise<SynthesizeResponse> {
    const outPath = createTempWavPath()
    const script = [
        "$ErrorActionPreference = 'Stop'",
        "$text = [Console]::In.ReadToEnd()",
        "$outFile = $env:SEVEN_CS_TTS_OUT",
        "$voiceTarget = $env:SEVEN_CS_TTS_VOICE",
        "$rate = [double]$env:SEVEN_CS_TTS_RATE",
        "$pitch = [double]$env:SEVEN_CS_TTS_PITCH",
        "$requireRhvoice = $env:SEVEN_CS_REQUIRE_RHVOICE -eq '1'",
        "$sp = New-Object -ComObject SAPI.SpVoice",
        "$allVoices = @($sp.GetVoices())",
        "$selected = $null",
        "if ($voiceTarget) {",
        "  $selected = $allVoices | Where-Object { $_.GetDescription() -eq $voiceTarget -or $_.Id -eq $voiceTarget } | Select-Object -First 1",
        "}",
        "if (-not $selected -and $requireRhvoice) {",
        "  $selected = $allVoices | Where-Object {",
        "    $vendor = ''",
        "    try { $vendor = [string]$_.GetAttribute('Vendor') } catch {}",
        "    ([string]$_.Id + ' ' + [string]$_.GetDescription() + ' ' + $vendor) -match 'RHVoice|Olga\\s+Yakovleva'",
        "  } | Select-Object -First 1",
        "}",
        "if ($requireRhvoice -and -not $selected) { throw 'No RHVoice SAPI 5 voice is installed.' }",
        "if ($selected) { $sp.Voice = $selected }",
        "$sapiRate = [int][Math]::Round(($rate - 1.0) * 6.0)",
        "$sp.Rate = [Math]::Min(10, [Math]::Max(-10, $sapiRate))",
        "$fs = New-Object -ComObject SAPI.SpFileStream",
        "$fs.Open($outFile, 3, $false)",
        "try {",
        "  $sp.AudioOutputStream = $fs",
        "  if ([Math]::Abs($pitch - 1.0) -gt 0.05) {",
        "    $escaped = [System.Security.SecurityElement]::Escape($text)",
        "    $sapiPitch = [int][Math]::Round(($pitch - 1.0) * 10.0)",
        "    $sapiPitch = [Math]::Min(10, [Math]::Max(-10, $sapiPitch))",
        "    $xml = \"<pitch absmiddle='$sapiPitch'>$escaped</pitch>\"",
        "    $sp.Speak($xml, 8) | Out-Null",
        "  } else {",
        "    $sp.Speak($text, 0) | Out-Null",
        "  }",
        "} finally {",
        "  $fs.Close()",
        "}"
    ].join("\n")

    try {
        const result = await runProcess(
            powershellExe,
            ["-NoProfile", "-NonInteractive", "-Command", script],
            {
                stdinText: text,
                env: {
                    SEVEN_CS_TTS_OUT: outPath,
                    SEVEN_CS_TTS_VOICE: voice,
                    SEVEN_CS_TTS_RATE: String(rate),
                    SEVEN_CS_TTS_PITCH: String(pitch),
                    SEVEN_CS_REQUIRE_RHVOICE: requireRhvoice ? "1" : "0"
                }
            }
        )

        if (result.code !== 0 || !fs.existsSync(outPath)) {
            return { error: result.stderr || "Windows SAPI 5 speech synthesis failed." }
        }

        const audioBuffer = fs.readFileSync(outPath)
        if (audioBuffer.length === 0) {
            return { error: "Windows SAPI 5 speech produced empty audio." }
        }
        return {
            audioBase64: audioBuffer.toString("base64"),
            mimeType: "audio/wav"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Windows SAPI 5 speech error."
        }
    } finally {
        removeFileQuietly(outPath)
    }
}

async function synthesizeWindowsSapi5(
    text: string,
    voice: string,
    rate: number,
    pitch: number,
    requireRhvoice: boolean
): Promise<SynthesizeResponse> {
    const primary = await runWindowsComSapiSynthesis(
        "powershell.exe",
        text,
        voice,
        rate,
        pitch,
        requireRhvoice
    )
    if (primary.audioBase64) {
        return primary
    }
    const ps32 = getSysWow64PowerShellPath()
    if (ps32) {
        return runWindowsComSapiSynthesis(ps32, text, voice, rate, pitch, requireRhvoice)
    }
    return primary
}

async function synthesizeWindowsNative(
    text: string,
    voice: string,
    rate: number,
    pitch: number
): Promise<SynthesizeResponse> {
    const outPath = createTempWavPath()
    const script = [
        "$ErrorActionPreference = 'Stop'",
        "$text = [Console]::In.ReadToEnd()",
        "$outFile = $env:SEVEN_CS_TTS_OUT",
        "$voiceTarget = $env:SEVEN_CS_TTS_VOICE",
        "$rate = [double]$env:SEVEN_CS_TTS_RATE",
        "$pitch = [double]$env:SEVEN_CS_TTS_PITCH",
        "$succeeded = $false",
        "try {",
        "  Add-Type -AssemblyName System.Runtime.WindowsRuntime",
        "  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]",
        "  function Await($WinRtTask, $ResultType) {",
        "    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)",
        "    $netTask = $asTask.Invoke($null, @($WinRtTask))",
        "    $netTask.Wait(-1) | Out-Null",
        "    $netTask.Result",
        "  }",
        "  [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType=WindowsRuntime] | Out-Null",
        "  $synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer",
        "  if ($voiceTarget) {",
        "    $matched = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.Id -eq $voiceTarget -or $_.DisplayName -eq $voiceTarget } | Select-Object -First 1",
        "    if ($matched) { $synth.Voice = $matched }",
        "  }",
        "  $synth.Options.SpeakingRate = [Math]::Min(6.0, [Math]::Max(0.5, $rate))",
        "  $synth.Options.AudioPitch = [Math]::Min(2.0, [Math]::Max(0.0, $pitch))",
        "  $stream = Await ($synth.SynthesizeTextToStreamAsync($text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])",
        "  $netStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)",
        "  $fs = [System.IO.File]::Create($outFile)",
        "  try { $netStream.CopyTo($fs) } finally { $fs.Close(); $netStream.Close() }",
        "  $succeeded = $true",
        "} catch {",
        "  $succeeded = $false",
        "}",
        "if (-not $succeeded) {",
        "  Add-Type -AssemblyName System.Speech",
        "  $sapi = New-Object System.Speech.Synthesis.SpeechSynthesizer",
        "  if ($voiceTarget) {",
        "    try { $sapi.SelectVoice($voiceTarget) } catch {}",
        "  }",
        "  $sapiRate = [int][Math]::Round(($rate - 1.0) * 6.0)",
        "  $sapi.Rate = [Math]::Min(10, [Math]::Max(-10, $sapiRate))",
        "  $sapi.SetOutputToWaveFile($outFile)",
        "  $sapi.Speak($text)",
        "  $sapi.Dispose()",
        "}"
    ].join("\n")

    try {
        const result = await runProcess(
            "powershell.exe",
            ["-NoProfile", "-NonInteractive", "-Command", script],
            {
                stdinText: text,
                env: {
                    SEVEN_CS_TTS_OUT: outPath,
                    SEVEN_CS_TTS_VOICE: voice,
                    SEVEN_CS_TTS_RATE: String(rate),
                    SEVEN_CS_TTS_PITCH: String(pitch)
                }
            }
        )

        if (result.code !== 0 || !fs.existsSync(outPath)) {
            return { error: result.stderr || "Windows native speech synthesis failed." }
        }

        const audioBuffer = fs.readFileSync(outPath)
        if (audioBuffer.length === 0) {
            return { error: "Windows native speech produced empty audio." }
        }
        return {
            audioBase64: audioBuffer.toString("base64"),
            mimeType: "audio/wav"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Windows native speech error."
        }
    } finally {
        removeFileQuietly(outPath)
    }
}

async function synthesizeMacNative(
    text: string,
    voice: string,
    rate: number
): Promise<SynthesizeResponse> {
    const outPath = createTempWavPath()
    const wordsPerMinute = Math.round(Math.min(400, Math.max(90, rate * 185)))
    const args = [
        "--file-format=WAVE",
        "--data-format=LEI16@22050",
        "-r",
        String(wordsPerMinute),
        "-o",
        outPath,
        "-f",
        "-"
    ]
    if (voice) {
        args.unshift("-v", voice)
    }

    try {
        const result = await runProcess("say", args, { stdinText: text })
        if (result.code !== 0 || !fs.existsSync(outPath)) {
            return { error: result.stderr || "macOS native speech synthesis failed." }
        }
        const audioBuffer = fs.readFileSync(outPath)
        return {
            audioBase64: audioBuffer.toString("base64"),
            mimeType: "audio/wav"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "macOS native speech error."
        }
    } finally {
        removeFileQuietly(outPath)
    }
}

async function synthesizeLinuxNative(
    text: string,
    voice: string,
    rate: number,
    pitch: number
): Promise<SynthesizeResponse> {
    const bin = resolveLinuxNativeBinary()
    if (!bin) {
        return { error: "No Linux local speech binary (espeak-ng/espeak) found." }
    }
    const wordsPerMinute = Math.round(Math.min(360, Math.max(80, rate * 175)))
    const espeakPitch = Math.round(Math.min(99, Math.max(0, pitch * 50)))
    const args = ["--stdout", "-s", String(wordsPerMinute), "-p", String(espeakPitch)]
    if (voice) {
        args.push("-v", voice)
    }

    try {
        const result = await runProcess(bin, args, { stdinText: text })
        if (result.code !== 0 || result.stdout.length === 0) {
            return { error: result.stderr || "Linux native speech synthesis failed." }
        }
        return {
            audioBase64: result.stdout.toString("base64"),
            mimeType: "audio/wav"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Linux native speech error."
        }
    }
}

async function synthesizeRhvoice(
    text: string,
    voice: string,
    rate: number,
    pitch: number,
    customRhvoicePath?: string
): Promise<SynthesizeResponse> {
    if (process.platform === "win32") {
        const sapiVoices = await listWindowsRhvoiceSapiVoices()
        if (sapiVoices.length > 0) {
            return synthesizeWindowsSapi5(text, voice, rate, pitch, true)
        }
    }

    const binary = resolveRhvoiceBinary(customRhvoicePath)
    if (!binary) {
        return {
            error:
                process.platform === "win32"
                    ? "No RHVoice SAPI 5 voice is installed. Download and run an RHVoice voice installer from rhvoice.org."
                    : "RHVoice was not found. Install RHVoice and a voice pack, or configure the RHVoice-test executable path."
        }
    }

    const outPath = createTempWavPath()
    const rhRate = Math.round(Math.min(100, Math.max(-100, (rate - 1) * 100)))
    const rhPitch = Math.round(Math.min(100, Math.max(-100, (pitch - 1) * 100)))

    const args: string[] = ["-r", String(rhRate), "-t", String(rhPitch), "-o", outPath]
    if (voice) {
        args.unshift("-p", voice)
    }

    try {
        const result = await runProcess(binary, args, { stdinText: text })
        if (result.code !== 0 || !fs.existsSync(outPath)) {
            return { error: result.stderr || "RHVoice speech synthesis failed." }
        }
        const audioBuffer = fs.readFileSync(outPath)
        if (audioBuffer.length === 0) {
            return { error: "RHVoice produced empty audio." }
        }
        return {
            audioBase64: audioBuffer.toString("base64"),
            mimeType: "audio/wav"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "RHVoice synthesis error."
        }
    } finally {
        removeFileQuietly(outPath)
    }
}

export async function synthesizeLocalSpeech(
    request: SynthesizeRequest
): Promise<SynthesizeResponse> {
    const text = (request.text || "").trim()
    if (!text) {
        return { error: "No text provided for speech synthesis." }
    }

    const rate = typeof request.rate === "number" ? request.rate : 1
    const pitch = typeof request.pitch === "number" ? request.pitch : 1
    const voice = request.voice || ""

    if (request.engine === "rhvoice") {
        return synthesizeRhvoice(text, voice, rate, pitch, request.rhvoicePath)
    }

    if (process.platform === "win32") {
        return synthesizeWindowsNative(text, voice, rate, pitch)
    }
    if (process.platform === "darwin") {
        return synthesizeMacNative(text, voice, rate)
    }
    return synthesizeLinuxNative(text, voice, rate, pitch)
}
