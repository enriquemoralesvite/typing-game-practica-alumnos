import { words } from './data.js'
const $time = document.querySelector('time')
const $paragraph = document.querySelector('p')
const $input = document.querySelector('input')
const $game = document.querySelector('#games')
const $results = document.querySelector('#results')
const $wpm = document.querySelector('#results-wpm')
const $accuracy = document.querySelector('#results-exactitud')
const $reloadButton = document.querySelector('#reload-button')

const INITIAL_TIME = 30 // Puedes cambiar esto a 60, 90, etc.

// 1. Objeto de Estado Centralizado
const STATE = {
  words: [],
  currentWordIndex: 0,
  currentTime: INITIAL_TIME,
  isPlaying: false,
  intervalId: null,
  isFinished: false
}

initGame()
initEvents()

function initGame () {
  resetState()

  $time.textContent = STATE.currentTime

  $paragraph.innerHTML = STATE.words.map((word, index) => {
    const letters = word.split('')

    return `<word>
      ${letters
        .map(letter => `<letter>${letter}</letter>`)
        .join('')
      }
    </word>
    `
  }).join('')
  
  // Ponemos el foco en la primera palabra y letra
  const $firstWord = $paragraph.querySelector('word')
  $firstWord.classList.add('active')
  $firstWord.querySelector('letter').classList.add('active')
}

function initEvents () {
  document.addEventListener('keydown', handleInitialKeydown)
  $input.addEventListener('input', handleInput)
  $input.addEventListener('keydown', handleSpecialKeys)
  $reloadButton.addEventListener('click', initGame)
}

function resetState() {
  $game.style.display = 'flex'
  $results.style.display = 'none'
  $input.value = ''

  STATE.isPlaying = false
  STATE.currentTime = INITIAL_TIME
  STATE.currentWordIndex = 0
  STATE.words = words.toSorted(() => Math.random() - 0.5).slice(0, 50)
  STATE.isFinished = false
  if (STATE.intervalId) clearInterval(STATE.intervalId)
}

function handleInitialKeydown () {
  if (!STATE.isPlaying) {
    startGame()
  }
  if (STATE.isFinished) return
}

function startGame() {
  STATE.isPlaying = true
  $input.focus()
  STATE.intervalId = setInterval(() => {
    STATE.currentTime--
    $time.textContent = STATE.currentTime
    if (STATE.currentTime === 0) {
      gameOver()
    }
  }, 1000)
}

function handleInput () {
  if (!STATE.isPlaying) return

  const $allWords = $paragraph.querySelectorAll('word')
  const $currentWord = $allWords[STATE.currentWordIndex]
  const typedValue = $input.value

  // Lógica para el cursor al final de la palabra
  const isWordCompleted = typedValue.length === $currentWord.children.length
  $currentWord.classList.toggle('cursor-space', isWordCompleted)

  // Lógica para validar letras
  const letters = $currentWord.children
  Array.from(letters).forEach((letter, index) => {
    const letterTyped = typedValue[index]

    if (letterTyped == null) {
      letter.classList.remove('correct', 'incorrect')
    } else if (letterTyped === letter.innerText) {
      letter.className = 'correct'
    } else {
      letter.className = 'incorrect'
    }
  })

  // Mover el cursor (letra activa)
  const $activeLetter = $paragraph.querySelector('letter.active')
  $activeLetter?.classList.remove('active')

  const nextActiveLetterIndex = typedValue.length
  if (!isWordCompleted) {
    $currentWord.children[nextActiveLetterIndex]?.classList.add('active')
  }
}

function handleSpecialKeys (event) {
  if (!STATE.isPlaying) return

  if (event.key === ' ') {
    event.preventDefault()
    
    const $allWords = $paragraph.querySelectorAll('word')
    const $currentWord = $allWords[STATE.currentWordIndex]
    const isWordCompleted = $input.value.length === $currentWord.children.length

    if (!isWordCompleted) return // No saltar si la palabra no está completa

    // Marcar palabra como correcta o incorrecta
    const hasIncorrectLetters = Array.from($currentWord.children).some(l => l.classList.contains('incorrect'))
    $currentWord.classList.add(hasIncorrectLetters ? 'marked' : 'correct')
    $currentWord.classList.remove('active', 'cursor-space')
    
    // Mover a la siguiente palabra
    STATE.currentWordIndex++
    $input.value = ''

    const $nextWord = $allWords[STATE.currentWordIndex]
    if (!$nextWord) {
      gameOver()
      return
    }
    $nextWord.classList.add('active')
    $nextWord.children[0].classList.add('active')
  }

  // Aquí se podría mejorar la lógica del backspace si se desea
}

function gameOver () {
  $game.style.display = 'none'
  $results.style.display = 'flex'
  clearInterval(STATE.intervalId)
  STATE.isPlaying = false
  STATE.isFinished = true

  const correctWords = $paragraph.querySelectorAll('word.correct').length
  const correctLetters = $paragraph.querySelectorAll('letter.correct').length
  const incorrectLetters = $paragraph.querySelectorAll('letter.incorrect').length
  const totalLetters = correctLetters + incorrectLetters

  const accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0
  const wpm = Math.round(correctWords * 60 / INITIAL_TIME)

  $wpm.textContent = wpm
  $accuracy.textContent = `${accuracy.toFixed(2)}%`
}