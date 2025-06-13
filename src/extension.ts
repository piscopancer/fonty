import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const setFontCommand = vscode.commands.registerCommand('fonty.setFont', () => {
    setFont()
  })
  const unsetFontCommand = vscode.commands.registerCommand('fonty.unsetFont', () => {
    unsetFont()
  })
  context.subscriptions.push(setFontCommand, unsetFontCommand)
}

const workbenchPath = path.join(vscode.env.appRoot, 'out/vs/code/electron-sandbox/workbench/workbench.html')

function getWorkbenchHtml() {
  return fs.readFileSync(workbenchPath).toString()
}

function buildStyleContent(fontName: string) {
  return `
  :is(.mac, .windows, .linux, :host-context(.OS), .monaco-inputbox input):not(.monaco-mouse-cursor-text) {
    font-family: ${fontName} !important;
  }
`
}

const fontUnsetMessage = 'Font unset. Restart app to apply.'

function setFont() {
  let font = vscode.workspace.getConfiguration('fonty').get('fontFamily') as string | undefined
  if (!font?.trim()) {
    vscode.window.showInformationMessage(fontUnsetMessage)
    return
  }
  if (font === 'default') {
    font = vscode.workspace.getConfiguration('editor').get('fontFamily') as string
  }
  const html = getWorkbenchHtml()
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const existingStyleEl = doc.querySelector('style#fonty')
  if (existingStyleEl) {
    existingStyleEl.innerHTML = buildStyleContent(font)
  } else {
    let styleEl = doc.createElement('style')
    styleEl.setAttribute('id', 'fonty')
    styleEl.innerHTML = buildStyleContent(font)
    doc.head.appendChild(styleEl)
  }
  fs.writeFileSync(workbenchPath, dom.serialize())
  vscode.window.showInformationMessage(`Font changed to ${font}. Restart app to apply.`)
}

function unsetFont() {
  vscode.workspace.getConfiguration('fonty').update('fontFamily', '', vscode.ConfigurationTarget.Global)
  const html = getWorkbenchHtml()
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const styleEl = doc.querySelector('style#fonty')
  if (styleEl) {
    doc.head.removeChild(styleEl)
  }
  fs.writeFileSync(workbenchPath, dom.serialize())
  vscode.window.showInformationMessage(fontUnsetMessage)
}

export function deactivate() {}
