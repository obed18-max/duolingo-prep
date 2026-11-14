/* Écoute : Listen and Type (phrases avec mots-outils, contractions, ponctuation) et Interactive Listening. */
window.LTYPE = [
  "I'm not sure that the library is open on Sundays.", 'The meeting has been moved to Thursday afternoon.', "She didn't have enough time to finish the report.",
  'Most of the students live within walking distance of the campus.', 'Could you send me the slides after the lecture?', 'The results will be published at the end of the month.',
  "We've been working on this project since January.", 'He asked whether the deadline could be extended.', 'There are fewer cars in the city centre than there used to be.',
  'The factory produces around two hundred engines a day.', "If it rains tomorrow, we'll cancel the trip.", 'You should have told me about the problem earlier.',
  'The new policy applies to all international students.', 'Please make sure that your phone is switched off.', 'Not all of the participants agreed with the conclusion.',
  "It's one of the most important discoveries of the century.", 'The bus to the airport leaves every twenty minutes.', 'I would rather study in the morning than at night.',
  'The supervisor wants us to focus on the quality of the data.', "They haven't decided where to hold the conference yet.", 'Many people are worried about the cost of living.',
  'The course is divided into three parts of equal length.', 'Applications must be submitted before the first of December.', "The engineers couldn't find the cause of the failure.",
  'Prices rose sharply at the beginning of the year.', 'Let me know if you need any help with the experiment.', 'The museum is closed for renovation until next spring.',
  'Students who miss more than two classes will lose points.', "I've already read the first chapter of the book.", 'The company is looking for someone with experience in logistics.',
  'Water levels in the reservoir are lower than usual.', 'It took them several years to develop the new vaccine.', 'Would it be possible to change my appointment?',
  'The professor explained the theory with a simple example.', 'Neither of the two solutions was cheap enough.', 'All of the equipment must be returned by Friday.'
];

window.ILISTEN = [
  { id: 'il1', t: 'Inscription à un cours', scene: 'You are a student. You go to the student services office to register for a course.',
    complete: 'Welcome to the {student} services office. Registration for spring courses is open until the {fifteenth} of January. To register, you need your student {number} and the code of each course. If a course is {full}, you can join the waiting {list} online.',
    convo: [
      { b: 'Hi there! How can I help you today?', o: ['I would like to register for a statistics course.', 'Yes, it is very helpful.', 'I registered yesterday at noon.', 'Thank you, you too.'], a: 0 },
      { b: 'Sure. Do you have your student number with you?', o: ['No, I prefer the morning.', 'Yes, here it is. It\'s on my card.', 'It is a very good number.', 'I will be a student next year.'], a: 1 },
      { b: 'Great. Unfortunately, the Tuesday group is already full.', o: ['That\'s perfect, thank you.', 'Is there another group, or can I join the waiting list?', 'I don\'t like Tuesdays either.', 'Full of what?'], a: 1 },
      { b: 'There\'s a Thursday group at four, but it\'s online only.', o: ['Online is fine for me. Please put me in that group.', 'Four students is not enough.', 'I am online every day.', 'Thursday was yesterday.'], a: 0 },
      { b: 'Done! You\'re registered. Anything else?', o: ['No, that\'s all. Thanks for your help.', 'Yes, I am registered.', 'Anything is possible.', 'I will register later.'], a: 0 }
    ],
    model: 'A student went to the student services office to register for a statistics course. The staff member asked for his student number and explained that the Tuesday group was already full. She offered an online group on Thursday at four o\'clock, and the student accepted it, so he was finally registered.' },
  { id: 'il2', t: 'Problème de logement', scene: 'You are renting a flat. You call your landlord because there is a problem with the heating.',
    complete: 'Hello, this is the property {management} office. Our office is open from Monday to {Friday}, nine to five. For urgent {repairs}, such as water leaks or heating {problems}, please call the emergency {line}.',
    convo: [
      { b: 'Hello, Mark speaking. What can I do for you?', o: ['Hi Mark, it\'s about the flat. The heating isn\'t working.', 'I can do many things.', 'I speak English and French.', 'Fine, and you?'], a: 0 },
      { b: 'Oh no. Since when has it been broken?', o: ['It was broken by the heating.', 'Since Sunday night. It\'s really cold inside.', 'Next week, I think.', 'For the winter.'], a: 1 },
      { b: 'I see. Have you checked whether the boiler is switched on?', o: ['Yes, I checked, and the light is on, but nothing happens.', 'I don\'t have any boilers.', 'Switch it on, please.', 'The boiler is very old, like me.'], a: 0 },
      { b: 'OK. I can send a technician tomorrow morning. Will you be at home?', o: ['No, I am a technician.', 'Tomorrow is Tuesday.', 'Yes, I\'ll be home until eleven.', 'I don\'t have a home.'], a: 2 },
      { b: 'Perfect. He\'ll come around nine. Sorry for the trouble.', o: ['No problem. Thank you for reacting so quickly.', 'You are in trouble.', 'Nine is too many.', 'Sorry, I can\'t hear you.'], a: 0 }
    ],
    model: 'A tenant called his landlord, Mark, because the heating in his flat had stopped working on Sunday night. Mark asked if the boiler was switched on, and the tenant said it was on but did not work. Mark agreed to send a technician the next morning at around nine, while the tenant would be at home.' },
  { id: 'il3', t: 'Projet de groupe', scene: 'You are a university student. A classmate talks to you about your group project.',
    complete: 'For the final project, each group must {analyse} a real company and propose {improvements} to one of its processes. The written report should not be {longer} than ten pages, and each group will give a fifteen-minute {presentation} in the last {week} of term.',
    convo: [
      { b: 'Hey! Have you chosen a company for our project yet?', o: ['Not yet. I was thinking of the car factory near the airport.', 'I chose a project yesterday.', 'Yes, I have a company of friends.', 'The project is very long.'], a: 0 },
      { b: 'Good idea. But do you think they will share their data with us?', o: ['Data is very important nowadays.', 'Maybe. My cousin works there, so I can ask him.', 'They share an office.', 'I don\'t think so, it is sunny.'], a: 1 },
      { b: 'Great. How should we divide the work?', o: ['Work is hard.', 'Let\'s divide it by two.', 'You could do the interviews, and I\'ll analyse the data.', 'We should work in different universities.'], a: 2 },
      { b: 'Sounds fair. When should we meet next?', o: ['We met last week.', 'How about Wednesday after the lecture?', 'Next is better than last.', 'I meet many people.'], a: 1 },
      { b: 'Wednesday works. I\'ll book a room in the library.', o: ['Perfect, see you then.', 'I don\'t have a book.', 'The library is a room.', 'Wednesday is in the middle.'], a: 0 }
    ],
    model: 'Two classmates discussed their group project. They chose to study a car factory near the airport, because one of them has a cousin who works there and could help them get data. They agreed that one person would do the interviews and the other would analyse the data, and they decided to meet on Wednesday in the library.' },
  { id: 'il4', t: 'Chez le médecin', scene: 'You are at a clinic. You speak to the receptionist and then to a nurse.',
    complete: 'Thank you for calling the city clinic. If you would like to make an {appointment}, please press one. For test {results}, press two. Please note that the clinic is {closed} on public holidays. In case of {emergency}, call one one {two}.',
    convo: [
      { b: 'Good morning. Do you have an appointment?', o: ['Yes, at ten thirty with Dr. Lopez.', 'Good morning, I have a car.', 'No, I don\'t like doctors.', 'It is ten thirty.'], a: 0 },
      { b: 'Thank you. Could you fill in this form while you wait?', o: ['I am waiting for the form.', 'Of course. Do you have a pen I could borrow?', 'The form is full.', 'I will wait for you.'], a: 1 },
      { b: 'Here you are. What seems to be the problem today?', o: ['The problem is the form.', 'I\'ve had a sore throat and a fever for three days.', 'Today is Monday.', 'I seem fine.'], a: 1 },
      { b: 'Have you taken any medicine for it?', o: ['Only some paracetamol, but it didn\'t help much.', 'I take the bus.', 'Medicine is expensive in Canada.', 'Yes, three days ago I was ill.'], a: 0 },
      { b: 'All right. The doctor will see you in about ten minutes.', o: ['Ten minutes is a long time ago.', 'Thank you, I\'ll wait here.', 'See you in ten years.', 'The doctor is busy.'], a: 1 }
    ],
    model: 'A patient arrived at a clinic for an appointment with Dr. Lopez at ten thirty. The receptionist asked him to fill in a form, and he borrowed a pen. He explained that he had had a sore throat and a fever for three days and that paracetamol had not helped much. He was told that the doctor would see him in about ten minutes.' },
  { id: 'il5', t: 'Entretien de stage', scene: 'You are at an interview for an internship in a manufacturing company.',
    complete: 'Our company {manufactures} parts for the automotive industry. Interns join the quality {department} for twelve weeks. During this time, they {collect} data on the production line, identify the main causes of {defects}, and present their {recommendations} to the managers.',
    convo: [
      { b: 'Thanks for coming. Could you tell me a little about yourself?', o: ['I am an industrial engineering student, and I\'m interested in quality improvement.', 'I came by bus.', 'Myself is good, thank you.', 'I am tall.'], a: 0 },
      { b: 'Why do you want to do an internship with us?', o: ['Because I need to do one.', 'Your company is a company.', 'I\'d like to apply Lean methods in a real automotive plant, and your plant is a leader.', 'I want to be your boss.'], a: 2 },
      { b: 'Have you ever worked with data analysis tools?', o: ['Yes, I use Excel every day, and I\'m learning Python.', 'I have a lot of tools at home.', 'Data is analysed by computers.', 'Never, but I like data.'], a: 0 },
      { b: 'Tell me about a time you solved a problem in a team.', o: ['Teams are very important.', 'During a project, our machine data was wrong, so I organised a check of each sensor and we found the fault.', 'I prefer to work alone.', 'I had a problem with a team once.'], a: 1 },
      { b: 'Great. Do you have any questions for us?', o: ['No questions, I know everything.', 'Yes. What would a typical day look like for an intern?', 'Questions are difficult.', 'Do you have any questions for me?'], a: 1 }
    ],
    model: 'An industrial engineering student had an interview for an internship in a manufacturing company. He explained that he wanted to apply Lean methods in a real automotive plant, and that he uses Excel and is learning Python. He described how he solved a data problem in a team by checking each sensor. At the end, he asked what a typical day for an intern looks like.' }
];
