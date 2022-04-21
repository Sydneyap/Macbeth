console.log(DATA.PLAY);
//Checks over all the data from the JSON file to understand how it's organized
//Sets all of the arrays that will be used for the charts
let line = [];
let speaker = [];
//Calls the div tag to change it by uploading the script
let script = document.getElementById("script");
let actLength = [];
let sceneLength = [];
let sceneAmount = [];
//Repeats for each act from the JSON file
DATA.PLAY.ACT.forEach((Act) => {
	//Takes the text from the act's title, turns it into an h1 text, and adds it to the script
	let act = document.createElement("h1");
	let h1node = document.createTextNode(Act.TITLE);
	act.appendChild(h1node);
	script.appendChild(act);
	//For every new act the act length increases in index by one
	actLength.push(0);
	//Takes the number of scenes per Act
	sceneAmount.push(Act.SCENE.length);
	//Repeats for every scene of the play
	Act.SCENE.forEach((Scene) => {
		//Takes the text from the scene's title, turns it into an h2 text, and adds it to the script
		let scene = document.createElement("h2");
		let h2node = document.createTextNode(Scene.TITLE);
		scene.appendChild(h2node);
		script.appendChild(scene);
		//For every scene, increase the scene length by one
		sceneLength.push(0);
		//Repeats for every speech in each scene in each act
		Scene.SPEECH.forEach((Speech) => {
			//For every speech, create a new table
			let t = document.createElement("table");
			//Since there must be a new row for each line, a counter is used
			let counter = 0;
			//Checks to see if there are multiple lines in one speech
			if (Array.isArray(Speech.LINE)){
				//If multiple, then it must repeat for each line of the speech
					Speech.LINE.forEach((Line) => {
						let r = t.insertRow(counter);
						let c1 = r.insertCell(0);
						let c2 = r.insertCell(1);
						//Only states the speaker for the first line
						if (Speech.LINE.indexOf(Line)==0){
							c1.innerHTML = `${Speech.SPEAKER}:`;
						}
							c2.innerHTML = Line;
							counter++;
							//Puts all the speeches and lines from each scene into two easily accessible arrays to use for the graph
							speaker.push(Speech.SPEAKER);
							line.push(Line);
							//Adds the length of each line to the sceneLength
							sceneLength[sceneLength.length-1] += Line.length;
						});
					}
				else {
					//Same process as above, the difference is that this is only for when the speech is one line long
					//Can't be the same since calling line[b] will call the first letter in the string
					let r = t.insertRow(counter);
					let c1 = r.insertCell(0);
					let c2 = r.insertCell(1);
					c1.innerHTML = `${Speech.SPEAKER}:`;
					c2.innerHTML = Speech.LINE;
					speaker.push(Speech.SPEAKER);
					line.push(Speech.LINE);
					counter++;
					sceneLength[sceneLength.length-1] += Speech.LINE.length;
				}
				//Once the speech is completely finished, upload it as a table to the script
				script.appendChild(t);
			});
			//Once the scene is over, add the length of the scene to the length of the act
			actLength[actLength.length-1] += sceneLength[sceneLength.length-1];
	});
});

//This section calculates the various data for the graph
//Pie chart
let amount = [];
let character =[];
//Goes for the length of the character list and checks each line of the play for the speaker
for (let i in DATA.PLAY.PERSONAE.PERSONA){
	//Combines the ensemble groups into one character so as to simplify the pie chart
	//In the JSON file, the character list is organized so that the ensemble characters appear first
	if (i<3){
		character[0] = "THE MURDERERS";
	} else if (i<10){
		character[1] = "THE WITCHES";
	} else if(i<16) {
		character[2] = "THE SERVANTS";
	}
	//Otherwise increase the character array as per usual
	else {
		character.push(DATA.PLAY.PERSONAE.PERSONA[i]);
	}
	//Use x as index for the amount array for the ensemble groups
	let x = character.length-1;
	for (let b in speaker){
		//Checks if the speaker is equal to character currently called in the character list, if so upload the equivalent line length to the array
		if(speaker[b] == DATA.PLAY.PERSONAE.PERSONA[i]){
			//Have to iniatialize the array, otherwise it returns with NaN
			if(amount[x]== null){
				amount[x] = line[b].length;
			}
			else{
				amount[x] += line[b].length;
			}
		}
	}
}
//Bar graph
let fullScript = "";
//Adds each line to one string to make up the full script
line.forEach(l => fullScript+=l +" ");
//Splits the script into individual words, which are lowercased so that each word is consistent and can be checked
let words = fullScript.toLowerCase().split(" ");
//Creates the x and y values of the array
//Have to set all 15 to zero so that you can compare them to other numbers
let Rankx = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let Ranky = [];
//Checks each word in the script
words.forEach((word) => {
	//Filters for every instance of the word in the script
		let frequency = words.filter(e => e === word);
		let checker = true;
		let i= 0;
		//Repeats only if checker is true
		while(checker){
			//Compares whether the current x is greater than the frequency
			//Stops when it is, otherwise all 15 would be the highest number
			if(Rankx[i]<=frequency.length){
				Rankx[i] = frequency.length;
				Ranky[i] = word;
				checker=false;
			//If the frequency is not greater than the current 15 values, end the loop
			} else if(i==15){
				checker = false;
			}
			//Add for each instance of the loop until 15
			i++;
		}
});
//Line Chart
let sceneNumber = [];
//Repeats for each scene to add the Scene Title
sceneLength.forEach((s) => sceneNumber.push("Scene " + sceneLength.indexOf(s)));

//Sets the ctx and original graph
let config;
const ctx = document.getElementById("myChart").getContext("2d");
let myChart = new Chart(ctx, config);

let chart = (number) =>{
	//Deletes the original graph so that it can work both onload and when clicking between graphs
	myChart.destroy();
	//Each onclick sets the number, so the config alternates
	//Zero is the pie chart
	if (number == 0){
		config = {
		  type: 'pie',
		  data: {
				//Using these arrays we have simplified x and y values to use for the pie chart
				labels: character,
			  datasets: [{
			    data: amount,
					borderColor:'rgb(8,8,8)',
					//The colour of the pie cutouts will alternate between these three colours, red, navy, and grey
					backgroundColor: [
			      'rgb(163,	51,	61)',
			      'rgb(71, 76, 75)',
			      'rgb(32,42,68)'
			    ]
			  }]
			},
			options: {
				//Allows to change the size of the chart from it's original form
				responsive: true,
		    maintainAspectRatio: false,
				plugins: {
					legend:{
						labels:{color:'rgb(200, 200, 200)'},
					},
					title: {
						display: true,
						text: 'Speaking Time Of Each Character',
						color:'rgb(200, 200, 200)',
						font: {
							size: 15
						}
					},
			  }
			}
		};
	}
	//One is the bar chart
	else if(number == 1){
		config = {
		  type: 'bar',
		  data: {
				//Using these arrays we have simplified x and y values to use for the pie chart
				labels: Ranky,
			  datasets: [{
			    data: Rankx,
					borderColor:'rgb(8,8,8)',
					//The colour of the pie cutouts will alternate between these three colours, red, navy, and grey
					backgroundColor: [
			      'rgb(163,	51,	61)',
			      'rgb(71, 76, 75)',
			      'rgb(32,42,68)'
			    ]
			  }]
			},
			options: {
				//Allows to change the size of the chart from it's original form
				responsive: true,
		    maintainAspectRatio: false,
				scales:{
					y:{
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'Instances Of The Word',
							color:'rgb(200, 200, 200)',
							display:true,
						},
					},
					x: {
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'The Word',
							color:'rgb(200, 200, 200)',
							display:true,
						}
					}
				},
				plugins: {
					legend:{
							display: false,
					},
					title: {
						display: true,
						text: 'The Most Frequently Used Words',
						color:'rgb(200, 200, 200)',
						font: {
							size: 15
						}
					},
			  }
			}
		};
	}
	//Two is the bubble chart
	else if(number == 2){
		//The radius of the circle is determined by the act number
		//Sizing isn't to scale which is why all are multiplied by 10
		let actNumber = [10,20,30,40,50];
		config = {
		  type: 'bubble',
		  data: {
				labels: sceneAmount,
				datasets: [{
				data:actLength,
				radius:actNumber,
 				 borderColor:'rgb(8,8,8)',
 					backgroundColor: [
						'rgb(163,	51,	61)',
 			    ]
				}]
			},
			options: {
				//Allows to change the size of the chart from it's original form
				responsive: true,
		    maintainAspectRatio: false,
				scales:{
					//Sets the tick colours to white to be more visible
					y:{
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'Length Of Each Act',
							color:'rgb(200, 200, 200)',
							display:true,
						},
					},
					x: {
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'Number Of Scenes Per Act',
							color:'rgb(200, 200, 200)',
							display:true,
						}
					}
				},
				plugins: {
					//Don't need legend which is automatically displayed so must set it to false
					legend: {
						display:false
					},
					title: {
						display: true,
						text: 'Analysis Of Each Act',
						color:'rgb(200, 200, 200)',
						font: {
							size: 15
						}
					},
			  }
			}
		};
	}
	//Three is the line chart
	else if(number == 3){
		config = {
		  type: 'line',
		  data: {
				labels: sceneNumber,
				datasets: [{
				data: sceneLength,
				radius: 8,
 				 borderColor:'rgb(32,42,68)',
 					backgroundColor: [
 			      'rgb(163,	51,	61)',
 			      'rgb(71, 76, 75)',
 			    ]
				}]
			},
			options: {
				//Allows to change the size of the chart from it's original form
				responsive: true,
		    maintainAspectRatio: false,
				scales:{
					x:{
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'Scene Number',
							color:'rgb(200, 200, 200)',
							display:true,
						}
					},
					y:{
						ticks: {
                color: 'rgb(200,200,200)',
            },
						title:{
							text:'Number Of Letters Used',
							color:'rgb(200, 200, 200)',
							display:true,
						}
					},
				},
				plugins: {
					legend:{
							display: false,
					},
					title: {
						display: true,
						text: 'Length Of Each Scene',
						color:'rgb(200, 200, 200)',
						font: {
							size: 15
						}
					}
				}
		},
	}
}
//To change the graph, set the config to one of the above and set the graph with it
	myChart = new Chart(ctx, config);
};
