var days = (Array.from({length: 24}, (_, i) => i + 1)).sort((a, b) => 0.5 - Math.random())

const calendar = document.getElementById('calendar');
const player = document.getElementById('player');
const today = new Date();

function isEnabled(number) {
  return (today.getMonth() == 10) && (today.getDate() >= number)
}

for(let i = 0; i < 24; i++) {
  const door = document.createElement('button');
  const content = document.createTextNode(days[i]);
  door.appendChild(content);
  door.classList.add('door');
  door.setAttribute('data-number', days[i])
  if(!isEnabled(days[i])) {
    door.setAttribute('disabled', true);
  }
  door.addEventListener('click', event => {
    player.pause();
    player.setAttribute('src', '/audio/kapitel'+days[i]+'.mp3');
    player.load();
    player.play();
  });
  calendar.appendChild(door);
}
