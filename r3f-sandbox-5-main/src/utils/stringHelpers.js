export const getRandomName = () => {
  const names = [
    'Jeeb', 'Smet', 'Casey', 'Taylor', 'Morgan', 'Avery', 'Riley', 'Quinn',
    'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Parker', 'Jamie', 'Chip',
    'Sam', 'Reese', 'Harper', 'Rowan', 'Charlie', 'Emerson', 'Finley', 'Hayden',
    'Jules', 'Kai', 'Logan', 'Micah', 'Glem', 'Oakley', 'Scode', 'Remy',
    'Shiloh', 'Tatum', 'Winter', 'Zion', 'Blair', 'Dallas', 'Elliot', 'Frankie',
    'Indigo', 'Jesse', 'Kendall', 'Lennon', 'Marley', 'Nico', 'Onyx', 'Raine',
    'Blaine', 'Arden', 'Briar', 'Cass', 'Dakota', 'Ellis', 'Greer', 'Hollis',
    'Jaden', 'Kieran', 'Landry', 'Milan', 'Nova', 'Orion', 'Saxton', 'Reagan',
    'Salem', 'Torian', 'Vesper', 'West', 'Zuri', 'Ash', 'Beck', 'Cove', 'Denim',
    'Echo', 'Florian', 'Gale', 'Harbor', 'Ira', 'Jory', 'Keaton', 'Lux', 'Mars',
    'North', 'Ocean', 'Pax', 'Quest', 'Revel', 'Scout', 'True', 'Vale', 'Weston',
    'Xenon', 'Yale', 'Zane', 'Brio', 'Calix', 'Dane', 'Evren', 'Fable', 'Glade',
    'Halcyon', 'Indra', 'Joss', 'Koa', 'Lyric', 'Matisse', 'Neo', 'Oberon', 'Palmer',
    'Quasar', 'Rune', 'Saber', 'Thorne', 'Umber', 'Vail', 'Wynn', 'Xavi', 'Yarden',
    'Zarek', 'Sloan', 'Toby', 'Val', 'Wren', 'Xen', 'Yuri', 'Zephyr'
  ];
  return names[Math.floor(Math.random() * names.length)];
};
