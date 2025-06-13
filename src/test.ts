import { readFileSync } from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'

function buildStyleContent(fontName: string) {
  return `
  :is(.mac, .windows, .linux, :host-context(.OS), .monaco-inputbox input):not(.monaco-mouse-cursor-text) {
    font-family: ${fontName} !important;
  }
`
}

const filePath = path.join(cwd(), 'src/html.html')

try {
  const file = readFileSync(filePath).toString()
} catch (error) {
  console.log(error)
}
