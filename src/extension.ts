import fs from 'fs'
import { HTMLElement, parse } from 'node-html-parser'
import path from 'path'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const applyFontCommand = vscode.commands.registerCommand('fonty.applyFont', () => {
    applyFont()
  })
  const applyDefaultFontCommand = vscode.commands.registerCommand('fonty.applyDefaultFont', () => {
    applyFont('default')
  })
  const setFontCommand = vscode.commands.registerCommand('fonty.setFont', async () => {
    const font = await vscode.window.showInputBox({
      placeHolder: 'my fancy font',
      title: 'Specify font you want to apply',
      prompt: 'Leave empty to unset.',
    })
    if (font?.trim()) {
      await applyFont(font)
    }
  })
  const unsetFontCommand = vscode.commands.registerCommand('fonty.unsetFont', async () => {
    await unsetFont()
  })
  context.subscriptions.push(
    //
    applyFontCommand,
    setFontCommand,
    unsetFontCommand,
    applyDefaultFontCommand
  )
}

const workbenchPath = path.join(vscode.env.appRoot, 'out/vs/code/electron-sandbox/workbench/workbench.html')

function getWorkbenchHtml() {
  return fs.readFileSync(workbenchPath).toString()
}

function buildStyleContent(fontName: string) {
  return `
:is(.mac, .windows, .linux, :host-context(.OS), .monaco-inputbox input):not(.monaco-mouse-cursor-text),
.monaco-editor .editorPlaceholder,
.view-lines.monaco-mouse-cursor-text,
.shadow-root-host
{
  font-family: ${fontName} !important;
}`
}

async function applyFont(_font?: string) {
  await vscode.workspace.getConfiguration('fonty').update('fontFamily', _font, vscode.ConfigurationTarget.Global)
  let font = vscode.workspace.getConfiguration('fonty').get('fontFamily') as string | undefined
  if (!font?.trim()) {
    vscode.commands.executeCommand('workbench.action.reloadWindow')
    return
  }
  if (font === 'default') {
    font = vscode.workspace.getConfiguration('editor').get('fontFamily') as string
  }
  const html = getWorkbenchHtml()
  const root = parse(html)
  const existingStyleEl = root.querySelector('style#fonty')
  if (existingStyleEl) {
    existingStyleEl.textContent = buildStyleContent(font)
  } else {
    let styleEl = new HTMLElement('style', { id: 'fonty' })
    styleEl.innerHTML = buildStyleContent(font)
    root.querySelector('head')!.append(styleEl)
  }
  fs.writeFileSync(workbenchPath, root.toString())
  vscode.commands.executeCommand('workbench.action.reloadWindow')
}

async function unsetFont() {
  await vscode.workspace.getConfiguration('fonty').update('fontFamily', '', vscode.ConfigurationTarget.Global)
  const html = getWorkbenchHtml()
  const root = parse(html)
  const styleEl = root.querySelector('style#fonty')
  if (styleEl) {
    root.querySelector('head')!.removeChild(styleEl)
  }
  fs.writeFileSync(workbenchPath, root.toString())
  vscode.commands.executeCommand('workbench.action.reloadWindow')
}

export function deactivate() {}
