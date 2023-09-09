import '../assets/styles/index.css'
import TetrisGame from './TetrisGame';

new TetrisGame("tetris");

const audiobtnElement = document.getElementById('audioControlBtn')
const audio = document.getElementById('myAudio');
audio.volume = 0
audiobtnElement.addEventListener('click', function() {
    if (audiobtnElement.classList.contains('audio-btn_muted')) {
        audiobtnElement.classList.add('audio-btn_active')
        audiobtnElement.classList.remove('audio-btn_muted')
        audio.volume = 0.3
    } else {
        audiobtnElement.classList.remove('audio-btn_active')
        audiobtnElement.classList.add('audio-btn_muted')
        audio.volume = 0
    }
});