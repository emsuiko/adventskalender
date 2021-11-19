var days = (Array.from({length: 24}, (_, i) => i + 1)).sort((a, b) => 0.5 - Math.random())

const chapter = []

const calendar = document.getElementById('calendar');
const player = document.getElementById('player');
const today = new Date();

function isEnabled(number) {
  return (today.getMonth() == 10) && (today.getDate() >= number)
}

function deactiveAllDoors() {
  const doors = document.getElementsByClassName('door');
  for(var i = 0; i < doors.length; i++) {
    doors[i].classList.remove('active');
  }
}

function updatePlayer(number) {
  player.pause();
  player.setAttribute('src', 'audio/kapitel'+number+'.mp3');
  player.load();
  player.play();
}

function doorClicked(number, event) {
  deactiveAllDoors();
  event.srcElement.classList.add('active');
  updatePlayer(number);
  document.getElementById('title').classList.remove('hide');
  document.getElementById('chapter').innerText = ' '+number;
  document.getElementById('name').innerText = chapter[number-1];
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
  door.addEventListener('click', event => doorClicked(days[i], event));
  calendar.appendChild(door);
}
