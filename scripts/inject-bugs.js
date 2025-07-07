import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bugs = [
  {
    name: 'modal-not-closing',
    description: 'Modal does not close on Escape key or outside click',
    files: [
      {
        source: 'bugs/Modal.buggy.jsx',
        target: 'src/components/Modal.jsx'
      }
    ]
  },
  {
    name: 'login-always-fails',
    description: 'Login always fails even with correct credentials',
    files: [
      {
        source: 'bugs/Login.buggy.jsx',
        target: 'src/pages/Login.jsx'
      }
    ]
  },
  {
    name: 'cart-calculation-wrong',
    description: 'Cart total calculation is incorrect',
    files: [
      {
        source: 'bugs/Cart.buggy.jsx',
        target: 'src/pages/Cart.jsx'
      }
    ]
  },
  {
    name: 'ui-misalignment',
    description: 'Cards and modal overlay are visually misaligned',
    files: [
      {
        source: 'bugs/index.buggy.css',
        target: 'src/index.css'
      }
    ]
  }
]

function injectBug(bugName) {
  const bug = bugs.find(b => b.name === bugName)
  if (!bug) {
    console.error(`Bug "${bugName}" not found. Available bugs:`)
    bugs.forEach(b => console.log(`  - ${b.name}: ${b.description}`))
    return
  }

  console.log(`Injecting bug: ${bug.description}`)
  
  bug.files.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file.source)
    const targetPath = path.join(__dirname, '..', file.target)
    
    // Backup original file
    const backupPath = `${targetPath}.backup`
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(targetPath, backupPath)
    }
    
    // Copy buggy version
    fs.copyFileSync(sourcePath, targetPath)
    console.log(`  Replaced ${file.target}`)
  })
  
  console.log(`Bug "${bugName}" injected successfully!`)
}

function restoreBug(bugName) {
  const bug = bugs.find(b => b.name === bugName)
  if (!bug) {
    console.error(`Bug "${bugName}" not found.`)
    return
  }

  console.log(`Restoring original files for: ${bug.description}`)
  
  bug.files.forEach(file => {
    const targetPath = path.join(__dirname, '..', file.target)
    const backupPath = `${targetPath}.backup`
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath)
      console.log(`  Restored ${file.target}`)
    } else {
      console.log(`  No backup found for ${file.target}`)
    }
  })
  
  console.log(`Files restored for "${bugName}"`)
}

function restoreAll() {
  console.log('Restoring all original files...')
  bugs.forEach(bug => {
    bug.files.forEach(file => {
      const targetPath = path.join(__dirname, '..', file.target)
      const backupPath = `${targetPath}.backup`
      
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, targetPath)
        console.log(`  Restored ${file.target}`)
      }
    })
  })
  console.log('All files restored!')
}

function listBugs() {
  console.log('Available bugs:')
  bugs.forEach(bug => {
    console.log(`  ${bug.name}: ${bug.description}`)
  })
}

// Command line interface
const command = process.argv[2]
const bugName = process.argv[3]

switch (command) {
  case 'inject':
    if (!bugName) {
      console.error('Please specify a bug name')
      listBugs()
    } else {
      injectBug(bugName)
    }
    break
  case 'restore':
    if (bugName) {
      restoreBug(bugName)
    } else {
      restoreAll()
    }
    break
  case 'list':
    listBugs()
    break
  default:
    console.log('Usage:')
    console.log('  node scripts/inject-bugs.js inject <bug-name>')
    console.log('  node scripts/inject-bugs.js restore [bug-name]')
    console.log('  node scripts/inject-bugs.js list')
    break
}