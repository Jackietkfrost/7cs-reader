import { app } from "electron"
import * as fs from "fs"
import * as path from "path"
import {
    AppSettings,
    DEFAULT_APP_SETTINGS,
    SETTINGS_FILE_NAME,
    SettingsPayload,
    normalizeSettings
} from "../types/Settings"

export function resolveSettingsPath(): string {
    const envOverride = process.env.SEVEN_CS_CONFIG_PATH?.trim()
    if (envOverride) {
        return path.resolve(envOverride)
    }

    const portableDir = process.env.PORTABLE_EXECUTABLE_DIR?.trim()
    if (portableDir) {
        const portablePath = path.join(portableDir, SETTINGS_FILE_NAME)
        if (fs.existsSync(portablePath)) {
            return portablePath
        }
    }

    return path.join(app.getPath("userData"), SETTINGS_FILE_NAME)
}

function ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

export function writeSettingsFile(filePath: string, settings: AppSettings): AppSettings {
    const normalized = normalizeSettings(settings)
    ensureDirectoryExists(filePath)
    fs.writeFileSync(filePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8")
    return normalized
}

export function readSettings(): SettingsPayload {
    const configPath = resolveSettingsPath()
    try {
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, "utf8")
            const parsed = JSON.parse(raw)
            return {
                settings: normalizeSettings(parsed),
                configPath
            }
        }
        const defaults = writeSettingsFile(configPath, DEFAULT_APP_SETTINGS)
        return { settings: defaults, configPath }
    } catch (error) {
        console.error("Failed to read settings config:", error)
        return {
            settings: normalizeSettings(DEFAULT_APP_SETTINGS),
            configPath
        }
    }
}

export function saveSettings(input: unknown): SettingsPayload {
    const configPath = resolveSettingsPath()
    const normalized = writeSettingsFile(configPath, normalizeSettings(input))
    return { settings: normalized, configPath }
}

export function resetSettings(): SettingsPayload {
    const configPath = resolveSettingsPath()
    const defaults = writeSettingsFile(configPath, DEFAULT_APP_SETTINGS)
    return { settings: defaults, configPath }
}

export function importSettingsFromFile(sourcePath: string): SettingsPayload {
    const raw = fs.readFileSync(sourcePath, "utf8")
    const parsed = JSON.parse(raw)
    return saveSettings(parsed)
}

export function exportSettingsToFile(destinationPath: string, input: unknown): void {
    writeSettingsFile(destinationPath, normalizeSettings(input))
}
