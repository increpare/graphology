
var canvas = document.getElementById('game');
	// get canvas context
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;

// load image


var cw=canvas.width;
var ch=canvas.height;

function reOffset(){
  var BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  offsetY=BB.top;        

	cw=canvas.width;
	ch=canvas.height;
}
var lösungen=0;
var offsetX,offsetY;
reOffset();
window["onscroll"]=function(e){ reOffset(); }
window["onresize"]=function(e){ reOffset(); }

var score=0;
var highscore=0;

var images=[];
var buchstabenBilder_hell={};
var buchstabenBilder={};
var buchstabenBilder_dunkel={};

var gw=4;
var gh=4;

var phase;
var anim_frames=5;
var anim_length=30;

var anim_phase;//goes to 10 say
var anim;
var spawn;

var verloren=false;
var siegreich=false;

var last=1;
var laster=-1;

var representativen=[];
for (var i=0;i<16;i++){
	representativen.push("");
}


var raster_b=10;
var raster_h=22;
var verborgene_zeilen=4;

var zustand=[];
var anims=[];


var eingabeWort="";
var zu_verarbeiten_Wort="";
var zu_verarbeiten_Wort_freqs=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],];
var zu_verarbeiten_Wort_max_freq=-1;
var in_wortliste=false;


var buchstaben_alle=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"];

var buchstaben=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var buchstaben_folge=["Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M"]

var tastaturReihenfolge = [
	["Q","W","E","R","T","Y","U","I","O","P"],
	 ["A","S","D","F","G","H","J","K","L"],
	  ["Z","X","C","V","B","N","M"]
];


function genBuchstaben(){
	buchstabenBilder={};
	buchstabenBilder_hell={};
	buchstabenBilder_dunkel={};

	for (var i=0;i<buchstaben_alle.length;i++){
		var b = buchstaben_alle[i];
		var maske = buchstabenMasken[b];


		var canvas = document.createElement("canvas");
		canvas.width = 3;
		canvas.height = 5;
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#14807e";


		var canvas_hell = document.createElement("canvas");
		canvas_hell.width = 3;
		canvas_hell.height = 5;
		var ctx_hell = canvas_hell.getContext("2d");
		ctx_hell.fillStyle = "#15c2a5";


		var canvas_dunkel = document.createElement("canvas");
		canvas_dunkel.width = 3;
		canvas_dunkel.height = 5;
		var ctx_dunkel = canvas_dunkel.getContext("2d");
		ctx_dunkel.fillStyle = "#1b2632";



		for (var x=0;x<3;x++){
			for (y=0;y<5;y++){
				if (maske[y][x]===0){
					continue;
				}
				ctx.fillRect( x, y, 1, 1 );
				ctx_hell.fillRect( x, y, 1, 1 );
				ctx_dunkel.fillRect( x, y, 1, 1 );
			}
		}

		// ctx.fillStyle = "red";
		// ctx.fillRect(0, 0, 100, 100);

		buchstabenBilder[b]=canvas;
		buchstabenBilder_hell[b]=canvas_hell;
		buchstabenBilder_dunkel[b]=canvas_dunkel;
	}
}

genBuchstaben();

var buchstabenBilder_muster_eng={};
var buchstabenBilder_muster={};
function genMuster(){

	for (var i=0;i<16;i++){
		//maske[j][i]+2*maske[j][i+1]+4*maske[j+1][i]+8*maske[j+1][i+1]
		var c00=i%2===1;
		var c10=Math.floor(i/2)%2===1;
		var c01=Math.floor(i/4)%2===1;
		var c11=Math.floor(i/8)%2===1;


		var canvas = document.createElement("canvas");
		canvas.width = 5;
		canvas.height = 5;
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#15c2a5";

		if (c00){
			ctx.fillRect( 0, 0, 2, 2 );
		}
		if (c10){
			ctx.fillRect( 3, 0, 2, 2 );
		}
		if (c01){
			ctx.fillRect( 0, 3, 2, 2 );
		}
		if (c11){
			ctx.fillRect( 3, 3, 2, 2 );
		}

		buchstabenBilder_muster[i]=canvas;
	}


	for (var i=0;i<16;i++){
		//maske[j][i]+2*maske[j][i+1]+4*maske[j+1][i]+8*maske[j+1][i+1]
		var c00=i%2===1;
		var c10=Math.floor(i/2)%2===1;
		var c01=Math.floor(i/4)%2===1;
		var c11=Math.floor(i/8)%2===1;


		var canvas = document.createElement("canvas");
		canvas.width = 2;
		canvas.height = 2;
		var ctx = canvas.getContext("2d");

		if (c00===false){
			ctx.fillStyle = "black";
		} else {
			ctx.fillStyle = "#15c2a5";
		}
		ctx.fillRect( 0, 0, 1, 1 );

		if (c10===false){
			ctx.fillStyle = "black";
		} else {
			ctx.fillStyle = "#15c2a5";
		}
		ctx.fillRect( 1, 0, 1, 1 );

		if (c01===false){
			ctx.fillStyle = "black";
		} else {
			ctx.fillStyle = "#15c2a5";
		}
		ctx.fillRect( 0, 1, 1, 1 );

		if (c11===false){
			ctx.fillStyle = "black";
		} else {
			ctx.fillStyle = "#15c2a5";
		}
		ctx.fillRect( 1, 1, 1, 1 );

		buchstabenBilder_muster_eng[i]=canvas;
	}

}
genMuster();

var image_x_y=[
// ["taste_gedrueckt","a",14,16,82,11],
// ["btn_unten_en","btn_unten_de",14,175,82,11],
// ["btn_links_en","btn_links_de",2,28,11,146],
// ["btn_rechts_en","btn_rechts_de",97,28,11,146],
// ["btn_neustart_en","btn_neustart_de",112,16,39,11],
// ["btn_sprache_en","btn_sprache_de",112,175,14,11],
// ["btn_stumm_gedrückt","btn_stumm_gedrückt",137,175,14,11],
];

var reihe_x_beginn=[5,5+2,5+5];

for (var j=0;j<tastaturReihenfolge.length;j++){
	var reihe=tastaturReihenfolge[j];
	for (var i=0;i<reihe.length;i++){
		var c = reihe[i];
		
		var x=reihe_x_beginn[j]+8*i;
		var y = 19+10*j;
		image_x_y.push(["taste_gedrueckt",buchstabenBilder_hell[c],x,y,x,y,7,9]);
	}
}

image_x_y.push(["enter_gedruecky",null,68-2,50-5-16,81-2,50-5-16,7,19,68-2,60-5-16,13,9])

function druckZeichenfolge(x,y,s,helligkeit){
	var ar = buchstabenBilder_dunkel;
	if (helligkeit===1){
		ar=buchstabenBilder;
	} else if (helligkeit===2){
		ar=buchstabenBilder_hell;		
	}
	s = s.toUpperCase();
	for (var i=0;i<s.length;i++){
		var c = s[i];
		if (c===" "){
			continue;
		}
		var bx = x+i*4;
		var by = y;
		ctx.drawImage(ar[c],bx,by);

	}
}


function holZufälligeIntInklusi(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min; 
}

var tetrominos = [
	//tetris
	[
		[
			[ 1, 1, 1, 1, ],
		],
		[
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ],
			[ 0, 0, 1, 0 ], 			
		],
		[
			[ 1, 1, 1, 1, ],
		],
		[
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ],
			[ 0, 1, 0, 0 ], 			
		],
	],
	// J-piece
	[
		[
			[ 1, 0, 0, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 1, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
			[ 1, 1, 0 ],
		],
	],
	// L-piece
	[
		[
			[ 0, 0, 1, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 1, 1, 1, ],
			[ 1, 0, 0, ],
		],
		[
			[ 1, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
	],
	// O-piece
	[
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
	],
	// S-piece
	[
		[
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 0, 0, ],
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 1, 0,0,  ],
			[ 1, 1,0,  ],
			[ 0, 1,0,  ],
		],
	],
	// T-Piece
	[
		[
			[ 0, 1, 0, ],
			[ 1, 1, 1, ],
		],

		
		[
			[ 0,1, 0, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],

		[
			[ 1, 1, 1, ],
			[ 0, 1, 0, ],
		],
		
		[
			[ 0, 1,0, ],
			[ 1, 1,0, ],
			[ 0, 1,0, ],
		],

	],
	// Z-stück
	[
		[
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0,0, 1, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 1, 1, 0, ],
			[ 1, 0, 0, ],
		],
	],
]

var lookupdat=[
	[4,0],//0000
	[1,0],//0001
	[3,0],//0010
	[2,0],//0011
	[0,0],//0100
	[3,1],//0101*
	[4,1],//0110*
	[6,0],//0111
	[0,2],//1000
	[3,2],//1001*
	[4,2],//1010*
	[5,1],//1011
	[0,1],//1100
	[5,0],//1101
	[6,1],//1110
	[5,2],//1111

]


var lookupdat_würfel=[
	[4,0],//0000
	[1,0],//0001
	[3,0],//0010
	[2,0],//0011
	[0,0],//0100
	[1,1],//0101*
	[2,1],//0110*
	[6,0],//0111
	[0,2],//1000
	[1,2],//1001*
	[2,2],//1010*
	[5,1],//1011
	[0,1],//1100
	[5,0],//1101
	[6,1],//1110
	[5,2],//1111

]

function binstr(d){
	var ts=d.toString(2);
	while(ts.length<4){
		ts="0"+ts;
	}
	return ts;//.split("").reverse().join("");
}
function lookup(figuretyp,datum){
	datum=(datum>>1)%16;
	var ts=binstr(datum);
	var tx=-1;
	var ty=-1;
	var lud=lookupdat[datum]

	if (figuretyp===3){
		lud=lookupdat_würfel[datum];
	}
	tx=lud[0];
	ty=lud[1];
	return [tx,ty];
}

function Verbindungen_Ausrechnen(raster,farbe){
	var breite=raster[0].length;
	var höhe=raster.length;
	for (var i=0;i<breite;i++){
		for (var j=0;j<höhe;j++){
			var v_oben=0;
			var v_unten=0;
			var v_links=0;
			var v_rechts=0;

			if (raster[j][i]===0){
				continue;
			}
			if (i>0&&raster[j][i-1]>0){
				v_links=1;
			}
			if (i+1<breite&&raster[j][i+1]>0){
				v_rechts=1;
			}


			if (j>0&&raster[j-1][i]>0){
				v_oben=1;
			}
			if (j+1<höhe&&raster[j+1][i]>0){
				v_unten=1;
			}

			raster[j][i]=1+2*v_rechts+4*v_links+8*v_unten+16*v_oben+32*farbe;
		}
	}
}

var verbindungen_ausgerechnet=false;


var zukünftiges=-1;
var zukünftiges_drehung=-1;

var nächst=-1;
var nächst_drehung=-1;
var tasche=[0,1,2,3,4,5,6];

async function prüfZeilen(){
	var dscore=0;
	var zeilen=[];
	for (var j=0;j<raster_h;j++){
		var voll=true;
		for (var i=0;i<raster_b;i++){
			if (zustand[j][i]===0){
				voll=false;
				continue;
			}
		}
		if (voll){		
			dscore++;
			for (var i=0;i<raster_b;i++){
				zustand[j][i]=0;
				//2*v_rechts+4*v_links+8*v_unten+16*v_oben
				if (j>0){
					if ( (zustand[j-1][i]&8) === 8 ){
						zustand[j-1][i]-=8;
					}
				} 
				if (j<raster_h-1){
					if ( (zustand[j+1][i]&16) === 16 ){
						zustand[j+1][i]-=16;
					}					
				}
			}
			zeilen.push(j);
		}
	}

	if (dscore>=4){
		siegreich=true;
	}

	// dscore=dscore*dscore;	
	if (dscore>0){
		redraw();		
		//kleine pause


		await sleep(50);
		//fallen lassen

		for (var j_index=0;j_index<zeilen.length;j_index++){
			var j_leer = zeilen[j_index];
			for (var j=j_leer;j>0;j--){
				for (var i=0;i<raster_b;i++){
					zustand[j][i]=zustand[j-1][i];
					zustand[j-1][i]=0;
				}
			}

			await sleep(50);
			redraw();
		}
		redraw();
	}

	score=dscore;
	if (score>highscore){
		highscore=score;
		localStorage.setItem('my_max_combo',highscore);
	}
}
function wähleNeuesStück(){
	nächst=zukünftiges;
	nächst_drehung=zukünftiges_drehung;

	zukünftiges_index=holZufälligeIntInklusi(0,tasche.length-1);
	zukünftiges=tasche[zukünftiges_index];	
	tasche.splice(zukünftiges_index,1);
	// if (nächst===6){
	// 	zukünftiges=4;
	// } else {
	// 	zukünftiges=6;

	// }
	zukünftiges_drehung=holZufälligeIntInklusi(0,tetrominos[zukünftiges].length-1)
	
	if (tasche.length===0){
		tasche=[0,1,2,3,4,5,6];		
	}
}

function darfPlatzieren(stück,x,y){

	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;
	for (var i=0;i<nächst_z_b;i++){
		var globale_x=x+i;
		for (var j=0;j<nächst_z_h;j++){
			var globale_y=y+j;
			if (stück[j][i]===0){
				continue;
			}
			if (globale_x>=raster_b || globale_y>=raster_h || globale_x<0 || globale_y<0){
				return false;
			}

			if (stück[j][i]>0 && zustand[globale_y][globale_x]>0){
				return false;
			}
		}
	}
	return true;
}

var template_namen=[
"template_1",
"template_2",
"template_3",
"template_4",
"template_5",
"template_6",
"template_7"
];

var soff=0;

function projizieren(){	
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+soff;
	var sy=0;

	var px=sx;
	var py=0;

	while (darfPlatzieren(stück,px,py+1)){
		py++;
	}

	if (moving===false){

		for (var i=0;i<nächst_z_b;i++){
			var globale_z_x=ox+8*px+8*i;
			for (var j=0;j<nächst_z_h;j++){
				if (py+j<2){

				}
				if (stück[j][i]>0){
					var globale_z_y=oy+8*py+8*j;
					if (globale_z_y<29){
						continue;
					}
					var lu = lookup(nächst,stück[j][i]);
					var tx=lu[0]*8;
					var ty=lu[1]*8;	
					ctx.drawImage(images["template_umriss"],tx,ty,8,8,globale_z_x,globale_z_y,8,8);
				}
			}
		}

	}


}

async function resetGame(){
soff=0;
	moving=true;

	verloren=false;
	siegreich=false;
	tasche=[0,1,2,3,4,5,6];

	wähleNeuesStück();
	wähleNeuesStück();

	

	zustand=[];
	for (var j=0;j<raster_h;j++){
		var zeile=[];
		var zeile_anim=[];
		for (var i=0;i<raster_b;i++){
			zeile.push(0);
			zeile_anim.push(0);
		}
		zustand.push(zeile);
		anims.push(zeile_anim);
	}
	if (verbindungen_ausgerechnet===false){
		for (var i=0;i<tetrominos.length;i++){
			var menge=tetrominos[i];
			for (var j=0;j<menge.length;j++){
				Verbindungen_Ausrechnen(menge[j],i);
			}
		}
		verbindungen_ausgerechnet=true;
	}

	anim=[//comesfrom
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]]];
	state=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	spawn=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	anim_phase=0;
	phase=0;
	score=0;

	// spawnRand(1);
	// for( anim_phase=0;anim_phase<2;anim_phase++){
	// 	redraw();
	// 	await sleep(30);
	// }
	// clearAnim();
	// redraw();

	// spawnRand(2);
	// for( anim_phase=0;anim_phase<2;anim_phase++){
	// 	redraw();
	// 	await sleep(30);
	// }
	// clearAnim();
	// redraw();
	
	moving=false;
	return Promise.resolve(1);
}


function animtick(){

	anim_phase++;
	if (anim_phase>anim_frames){
		anim_phase=anim_frames;
	}


	if (anim_phase<anim_frames)	{
		setTimeout(animtick,anim_length);		
	} else {
		phase=0;
	}

	redraw();
}

var piece_frames={
	1:["weiss","weiss_1","weiss_1","weiss_1"],
	2:["schwarz","schwarz_1","schwarz_1","weiss_1"],
	};


var goimg_name =["verloren_en","verloren_de"];
var siegimg_name =["siegreich_en","siegreich_de"];

function redraw(){

	
	// ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(images["bg"], 0, 0);	
	if (lösungen===0){

	}else if (lösungen<16){
		var pc=lösungen/16;
		var m_y=25/2;
		ctx.drawImage(images["kunst_dim"], 0,0,79,25,6, 55+Math.round(m_y-m_y*pc),79,Math.round(25*pc));	
	} else {
		ctx.drawImage(images["kunst"], 0,0,79,25,6, 55,79,25);			
	}

	
	
	// druckZeichenfolge(5,77,"Representatives",1);
	

	// if (zu_verarbeiten_Wort.length>0){
	// 	if (wörter.indexOf(zu_verarbeiten_Wort)>=0){
	// 		druckZeichenfolge(97,67,"Valid English word",2);
	// 	} else {
	// 		druckZeichenfolge(97,67,"Invalid English word",0);
	// 	}
	// }

	for (var i=0;i<eingabeWort.length;i++){
		var c = eingabeWort[i];
		// buchstabenBilder_hell[c].imageSmoothingEnabled=false;
		ctx.drawImage(buchstabenBilder_hell[c],0,0,3,5,34+9*i,6,6,10);
	}


	for (var i=0;i<zu_verarbeiten_Wort.length;i++){
		var c = zu_verarbeiten_Wort[i];
		// buchstabenBilder_hell[c].imageSmoothingEnabled=false;
		ctx.drawImage(buchstabenBilder[c],0,0,3,5,124+7*i,5,6,10);
	}

	for (var i=0;i<16;i++){
		muster=buchstabenBilder_muster[i];
		var cx=i%4;
		var cy=Math.floor(i/4)%4;
		var x=92+cy*22;
		var y=19+8*cx;
		ctx.drawImage(muster,x,y);

		var freqs=zu_verarbeiten_Wort_freqs[i];


		var fs = freqs.length.toString();
		while(fs.length<3){
			fs="0"+fs;
		}

		druckZeichenfolge(x+8,y,fs,markierung===i?1:0)

		if (zu_verarbeiten_Wort.length>0 &&markierung===i){
			for (var j=0;j<freqs.length;j++){
				var bs = freqs[j][0];
				var m_x=freqs[j][1];
				var m_y=freqs[j][2];
				
				ctx.drawImage(buchstabenBilder_muster_eng[i],0,0,2,2,124+7*bs+2*m_x,5+2*m_y,4,4);
			}
		}

		//freq
		if (zu_verarbeiten_Wort_max_freq===i){

			ctx.fillStyle = "rgba(0,0,0,0)";
			ctx.strokeStyle = "#14807e";
			ctx.lineWidth=1;
			ctx.strokeRect(x-2+0.5,y-2+0.5, 23-1, 9-1);
		}
		

		x=92+cy*22;
		y=53+cx*8;
		ctx.drawImage(muster,x,y);



		if (representativen[i]!==""){
			druckZeichenfolge(x+8,y,representativen[i],1)
		}

	}
	// return;

	// //nächst
	// var nox=115;
	// var noy=91;
	// var nächst_stück=tetrominos[nächst][nächst_drehung];
	// var nächst_z_h=nächst_stück.length;
	// var nächst_z_b=nächst_stück[0].length;
	// var nächst_h=nächst_z_h*8;
	// var nächst_b=nächst_z_b*8;
	
	// var zukünftiges_stück=tetrominos[zukünftiges][zukünftiges_drehung];
	// var zukünftiges_z_h=zukünftiges_stück.length;
	// var zukünftiges_z_b=zukünftiges_stück[0].length;
	// var zukünftiges_h=zukünftiges_z_h*8;
	// var zukünftiges_b=zukünftiges_z_b*8;
	

	// nox+=(4*8-zukünftiges_b)/2;
	// noy+=(4*8-zukünftiges_h)/2;
	// for (var i=0;i<zukünftiges_z_b;i++){
	// 	for (var j=0;j<zukünftiges_z_h;j++){
	// 		var z=zukünftiges_stück[j][i];
	// 		if (z!==0){
	// 			var x=nox+8*i;
	// 			var y=noy+8*j;
				
	// 			var lu = lookup(zukünftiges,zukünftiges_stück[j][i]);
	// 			var tx=8*lu[0];
	// 			var ty=8*lu[1];
	// 			ctx.drawImage(images[template_namen[zukünftiges]],tx,ty,8,8,x,y,8,8);
	// 		}
	// 	}
	// }

	// for (var i=0;i<raster_b;i++){
	// 	for (var j=verborgene_zeilen;j<raster_h;j++){
	// 		var z=zustand[j][i];
	// 		if (z!==0){
	// 			var sbx=15;
	// 			var sby=29;

	// 			var x=sbx+8*i;
	// 			var y=sby+8*(j-verborgene_zeilen);
				
	// 			var datum=zustand[j][i];
	// 			var stücktyp=datum>>5;
	// 			console.log(stücktyp);
	// 			var lu = lookup(stücktyp,datum);
	// 			var tx=8*lu[0];
	// 			var ty=8*lu[1];

	// 			ctx.drawImage(images[template_namen[stücktyp]],tx,ty,8,8,x,y,8,8);
	// 		}
	// 	}
	// }

	// projizieren();

	// for(var i=0;i<3;i++){
	// 	var z_b=3;
	// 	var z_h=5;
	// 	var z_x=125;
	// 	var z_y=70;
	// 	var ziffer= Math.floor(score/(Math.pow(10,i)))%10;
	// 	ctx.drawImage(images["ziffer_sch"],3*ziffer,0,z_b,z_h,z_x+4*i,z_y,z_b,z_h);
	// }


	// for(var i=0;i<3;i++){
	// 	var z_b=3;
	// 	var z_h=5;
	// 	var z_x=125;
	// 	var z_y=161;
	// 	var ziffer= Math.floor(highscore/(Math.pow(10,i)))%10;
	// 	ctx.drawImage(images["ziffer_sch"],3*ziffer,0,z_b,z_h,z_x+4*i,z_y,z_b,z_h);
	// }


	// if (stumm){
	// 	ctx.drawImage(images["btn_stumm_aus"],137,175);
	// }
	for(var i=0;i<26;i++){
		var dat = image_x_y[i];
		//["taste_gedrueckt",buchstabenBilder_hell[c],x,y,7,9]
		
		var bg_gedrückt=dat[0];
		var bg_buchstabe=dat[1];
		var x=dat[2];
		var y=dat[3];

		if (pressed[i]){
			ctx.drawImage(images[bg_gedrückt],x,y);
			ctx.drawImage(bg_buchstabe,x+1,y+3);
		} else {
			ctx.drawImage(bg_buchstabe,x+2,y+2);
		}
	}

	for (var i=26;i<image_x_y.length;i++){
		if (pressed[i]){
			var dat = image_x_y[i];
			ctx.drawImage(images[dat[0]],dat[2],dat[3]);
		} else {

		}
	}


	if (verloren){
		ctx.drawImage(images[goimg_name[sprache]],15,29);
	} else if (siegreich){		
		ctx.drawImage(images[siegimg_name[sprache]],15,29);
	}
}

var image_names=[
	"bg",
	"taste_gedrueckt",
	"enter_gedruecky",
	"kunst",
	"kunst_dim"
	];

var stumm=false;


for (var i=0;i<image_names.length;i++){
	var image = new Image();
	image.onload = function () {
	    // draw the image into the canvas
	    redraw();
	}
	image.src = image_names[i]+".png";
	images[image_names[i]]=image;
}

function trypush(dx,dy){
	var anymoved=false;	
	for (var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			if (state[i][j]===0){
				continue;
			}

			var ti=i+dx;
			var tj=j+dy;
			if (ti<0||ti>=gw||tj<0||tj>=gh){
				continue;
			}
			if (state[ti][tj]===0){
				state[ti][tj]=state[i][j];
				state[i][j]=0;

				anim[ti][tj][0]=anim[i][j][0]-dx;
				anim[ti][tj][1]=anim[i][j][1]-dy;
				anim[i][j][0]=0;
				anim[i][j][1]=0;


				anymoved=true;
			}
		}
	}
	return anymoved;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAnim(){
	for (var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			anim[i][j][0]=0;
			anim[i][j][1]=0;
			spawn[i][j]=0;
		}
	}
}

function full(){
	for (var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			if (state[i][j]===0){
				return true;
			}
		}
	}
	return false;
}

var moving=false;

function ErzeugenMöglich(){
	for (var j=0;j<verborgene_zeilen;j++){
		for (var i=0;i<raster_b;i++){
			if (zustand[j][i]!==0){
				return false;
			}
		}
	}
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2);
	var sy=0;

	for (var i=0;i<nächst_z_b;i++){
		var globale_z_x=sx+i;
		for (var j=0;j<nächst_z_h;j++){
			var globale_z_y=sy+j;
			if (zustand[globale_z_y][globale_z_x]>0){
				return false;
			}
		}
	}
	return true;
}

async function doMove(dx,dy){
	//stück erzeugen
	if (verloren||siegreich){
		return Promise.resolve(1);
	}


	if (dy==1){
		if (ErzeugenMöglich()===false){
			verloren=true;
			redraw();
			return Promise.resolve(1);
		}

		var stück=tetrominos[nächst][nächst_drehung];
		var nächst_z_h=stück.length;
		var nächst_z_b=stück[0].length;

		var ox=15;
		var oy=29-4*8;

		var sx=5-Math.ceil(nächst_z_b/2)+soff;
		var sy=0;
		soff=0;
		for (var i=0;i<nächst_z_b;i++){
			var globale_z_x=sx+i;
			for (var j=0;j<nächst_z_h;j++){
				var globale_z_y=sy+j;
				zustand[globale_z_y][globale_z_x]=stück[j][i];
			}
		}

		wähleNeuesStück();

	} else {

	}




	var bewegt=true;
	while (bewegt){
		bewegt=false;

		var neuezustand=[];
		for (var j=0;j<raster_h;j++){
			var zeile=[];
			for (var i=0;i<raster_b;i++){
				zeile.push(0);
			}
			neuezustand.push(zeile);
		}

		for (var i=0;i<raster_b;i++){
			for (var j=0;j<raster_h;j++){
				if (zustand[j][i]===0){
					anims[j][i]=0;
				} else {
					anims[j][i]=1;
				}
			}
		}


		var verarbeiten=true;
		while (verarbeiten){
			verarbeiten=false;

			//bewegungen versperren

			for (var i=0;i<raster_b;i++){
				for (var j=0;j<raster_h;j++){
					//wenn animation versperrt, mach propagation
					if (zustand[j][i]>0 && anims[j][i]>0){
						//prüf in der richtung der Bewegung
						var tx=i+dx;
						var ty=j+dy;
						if (tx<0||ty<0||tx>=raster_b||ty>=raster_h){
							anims[j][i]=0;
							verarbeiten=true;
						} else if (zustand[ty][tx]>0 && anims[ty][tx]===0){
							anims[j][i]=0;
							verarbeiten=true;							
						} else {
							//prüf verbundnen Ziegel
							var datum = zustand[j][i];
							//2*v_rechts+4*v_links+8*v_unten+16*v_oben
							var v_oben=(datum>>4)&1;
							var v_unten=(datum>>3)&1;
							var v_links=(datum>>2)&1;
							var v_rechts=(datum>>1)&1;
							if (v_oben===1){
								if (anims[j-1][i]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_unten===1){
								if (anims[j+1][i]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_links===1){
								if (anims[j][i-1]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_rechts===1){
								if (anims[j][i+1]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
						}
					}
				}
			}
		}

		//mach bewegungen
		var was_ist_bewegt=false;
		for (var i=0;i<raster_b;i++){
			for (var j=0;j<raster_h;j++){
				var datum=zustand[j][i];
				if (datum!==0){
					if (anims[j][i]===0){
						neuezustand[j][i]=datum;
					} else {
						neuezustand[j+dy][i+dx]=datum;
						anims[j][i]=0;
						was_ist_bewegt=true;
					}
				}
			}
		}
		zustand=neuezustand;

		if (was_ist_bewegt){
			bewegt=true;
		}	

		if (bewegt){
			await sleep(30);
			redraw();
			// if (dx!==0){
			// 	return Promise.resolve(1);				
			// }
		} else {


		}

	}

	await prüfZeilen();

	if (ErzeugenMöglich()===false){
		verloren=true;
		redraw();
	}
	return Promise.resolve(1);
}

function dsoff(ds){
	var newsoff=soff+ds;

	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+newsoff;
	var sy=0;

	var px=sx;
	var py=0;

	if (darfPlatzieren(stück,sx,sy)){
		soff=newsoff;
	}
}

function oob(){
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+soff;
	var sy=0;

	var px=sx;
	var py=0;

	if (darfPlatzieren(stück,sx,sy)===false){
		if (soff<0){
			soff++;
			oob();
		}
		if (soff>0){
			soff--;
			oob();
		}
	}
}

async function doPress(i){

	if (moving===true){
		return;
	}

	moving=true;

	pressed[i]=true;

	if (i<26 && eingabeWort.length<3){
		eingabeWort=eingabeWort+buchstaben_folge[i];
	} else if (i===26){
		if (eingabeWort.length>0){
			zu_verarbeiten_Wort=eingabeWort;
			zu_verarbeiten_Wort_freqs=wortFreqs(zu_verarbeiten_Wort)


			var werts=zu_verarbeiten_Wort_freqs.map(l=>l.length);
			zu_verarbeiten_Wort_max_freq = indexVonEinmaligeMaxzahl(werts);
			
			in_wortliste=true;//wörter.indexOf(zu_verarbeiten_Wort)>=0;

			if (in_wortliste && zu_verarbeiten_Wort_max_freq>=0 && representativen[zu_verarbeiten_Wort_max_freq]===""){
				representativen[zu_verarbeiten_Wort_max_freq]=zu_verarbeiten_Wort;
				lösungen++;
				if (lösungen===16){
					playSound(54041103)
				} else {
					playSound(39013100)
				}
			} else {
				playSound(39009302);			
			}
			eingabeWort="";
		} else {
			playSound(39009302);	
			eingabeWort="";			
		}
	}
	
	// if (i===0){
	// 	// await doMove(0,-1);
	// 	nächst_drehung=(nächst_drehung+1)%tetrominos[nächst].length;
	// 	oob();
	// } else if (i===1){
	// 	await doMove(0,1);
	// } else if (i===2){
	// 	dsoff(-1);
	// 	await doMove(-1,0);
	// } else if (i===3){	
	// 	dsoff(1);
	// 	await doMove(1,0);
	// } else if (i===4){
	// 	await resetGame();
	// } else if (i===5){
	// 	sprache=1-sprache;
	// 	// await resetGame();
	// } else if (i===6){
	// 	stumm=!stumm;
	// 	if (stumm===true){
	// 		image_x_y[6][0]="btn_stumm_aus_gedrückt";
	// 		image_x_y[6][1]="btn_stumm_aus_gedrückt";
	// 	} else {
	// 		image_x_y[6][0]="btn_stumm_gedrückt";
	// 		image_x_y[6][1]="btn_stumm_gedrückt";
	// 	}
	// }

	moving=false;
	redraw();

}

function  getMousePos(evt) {
	var rect = canvas.getBoundingClientRect(), // abs. size of element
	scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

	var clientX=evt.clientX;
	var clientY=evt.clientY;

	if (scaleX<scaleY){
		scaleX=scaleY;
		clientX-=rect.width/2-(cw/scaleX)/2;
	} else {
		scaleY=scaleX;
		clientY-=rect.height/2-(ch/scaleY)/2;
	}
	var x = (clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	var y =(clientY - rect.top) * scaleY     // been adjusted to be relative to element

	return [x,y];
}

var target=-1;


function handleUntap(e){
	if (target>=0){
		pressed[target]=false;
		target=-1;
		redraw();
	}
}

function handleTap(e){


	var [mouseX,mouseY] =getMousePos(e);



	// var xoff=0;
	// var yoff=0;

	// var canvas_width_pixeled=Math.floor(canvas.width*canvas.width/rect.width);
	// var canvas_height_pixeled=Math.floor(canvas.width*canvas.height/rect.height);

	// xoff = Math.floor(canvas_width_pixeled/2-cw/2);
	// yoff = Math.floor(canvas_height_pixeled/2-ch/2);

	// mouseX+=xoff;
	// mouseY+=yoff;

	for (var i=0;i<image_x_y.length;i++){
		var dat = image_x_y[i];  

		for (var k=0;k+4<dat.length;k+=4){
			var x_min=dat[k+4];
			var y_min=dat[k+5];
			var x_max=dat[k+4]+dat[k+6];
			var y_max=dat[k+5]+dat[k+7];

			if (mouseX>=x_min&&mouseX<=x_max&&mouseY>=y_min&&mouseY<=y_max){

				if (target>=0){
					pressed[target]=0;
				}
				target=i;

				doPress(i);
			}
		}

	}

}

function emptyCells(){
	var result=[];
	for(var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			if (state[i][j]===0){
				result.push([i,j]);
			}
		}
	}
	return result;
}

function neighbors (x,y){
  var result=[];
  if (x>0){
    result.push([x-1,y]);
  }
  if (x<gw-1){
    result.push([x+1,y]);
  }
  if (y>0){
    result.push([x,y-1]);
  }
  if (y<gh-1){
    result.push([x,y+1]);
  }
  return result;
}

function versuchFloodFill(x,y,todelete){


	if (state[x][y]===0){
	  return false;
	}

  var farbe = state[x][y];
  
  var base_idx=x+gw*y;
  if (todelete.indexOf(base_idx)>=0){
    return false;
  }

  
  var visited=[base_idx];

  var modified=true;
  while(modified){
    modified=false;

    for (var i=0;i<gw;i++){
      for (var j=0;j<gh;j++){
        var idx = i+gw*j;
        if (visited.indexOf(idx)>=0){
          continue;
        }

        //check if you've visited neighbours
        var hasneighbour=false;
        var nbs = neighbors(i,j);
        for (var k=0;k<nbs.length;k++){
          var nb = nbs[k];
          var nbi=nb[0]+gw*nb[1];
          if (visited.indexOf(nbi)>=0){
            hasneighbour=true;
          }
        }
        if (hasneighbour===false){
          continue;
        }

        var zelle_farbe=state[i][j];
        if (zelle_farbe==0){
          //escaped -- return! :)
          return false;
        }
        if (zelle_farbe!==farbe){
          continue;
        }

        visited.push(idx);
        modified=true;
      }
    }
  }

  if (visited.length===16){
    visited=[];
  }
  for (var i=0;i<visited.length;i++){
    todelete.push(visited[i]);
  }
  return visited.length>0;
}


function handleKeyDown(e){
	if (e.key)
	var uk = e.key.toUpperCase();
	for (var i=0;i<buchstaben_folge.length;i++){
		if (uk===buchstaben_folge[i]){			
			doPress(i);
			e.preventDefault();
			return false;
		}
	}

	if (e.key==="Enter"){		
		doPress(26);
		e.preventDefault();
		return false;
	}
}

var pressed=[];
for (var i=0;i<60;i++){
	pressed.push(false);
}

var buchstabenAnalysen={};
var buchstabenPatternFreqs={};
var buchstabenPatternMaxIndex={};

var markierung=0;

function markierungZyklus(){
	markierung=(markierung+1)%16;
	redraw();
}

setInterval(markierungZyklus, 500);

function wortFreqs(zf){
	var result=[];
	for (var i=0;i<16;i++){
		result.push([]);
	}
	for (var i=0;i<zf.length;i++){
		var c = zf[i];
		var pf = buchstabenAnalysen[c];
		for (var j=0;j<16;j++){
			for (var k=0;k<pf[j].length;k++){
				var eintrag=pf[j][k];
				result[j].push([i,eintrag[0],eintrag[1]])
			}
		}
	}
	return result;
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

function indexVonEinmaligeMaxzahl(arr){
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;
    var maxcount=1;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
            maxcount=1;
        } else if (arr[i]===max){
        	maxcount++;
        }
    }
    if (maxcount===1){
    	return maxIndex;
    } else {
    	return -1;
    }
}

function buchstaben2x2(){
	for (var k=0;k<buchstaben.length;k++){
		var b = buchstaben[k];
		var maske = buchstabenMasken[b];
		var eintrag = [];
		for (var i=0;i<16;i++){
			eintrag.push([]);
		}
		for (var i=0;i<2;i++){
			for (var j=0;j<4;j++){
				var a = maske[j][i]+2*maske[j][i+1]+4*maske[j+1][i]+8*maske[j+1][i+1];
				eintrag[a].push([i,j]);
			}
		}
		buchstabenAnalysen[b]=eintrag;
		var werts=eintrag.map(l=>l.length);
		var max = indexOfMax(werts);
		buchstabenPatternFreqs[b]=werts;
		buchstabenPatternMaxIndex[b]=max;
	}
}

buchstaben2x2();
console.log(buchstabenAnalysen);
console.log(JSON.stringify(buchstabenPatternFreqs));
console.log(buchstabenPatternMaxIndex);

function handleKeyUp(e){

	var uk = e.key.toUpperCase();
	for (var i=0;i<buchstaben_folge.length;i++){
		if (uk===buchstaben_folge[i]){		
			pressed[i]=false;
			redraw();
		}
	}

	if (e.key==="Enter"){		
		pressed[26]=false;
		redraw();
	}

}

canvas.addEventListener("pointerdown",handleTap);
canvas.addEventListener("pointerup",handleUntap);
document.addEventListener("keydown",handleKeyDown);
document.addEventListener("keyup",handleKeyUp);

highscore = parseInt(localStorage.getItem('my_max_combo'));
if (Number.isNaN(highscore)){
	highscore=0;
}

resetGame();

// var liste=[];
// for (var i=0;i<16;i++){
// 	liste.push([]);
// }
// for (var i=0;i<wörter.length;i++){
// 	var wort=wörter[i];
// 	var freqs = wortFreqs(wort);
// 	var werts=freqs.map(l=>l.length);
// 	var max_i=indexVonEinmaligeMaxzahl(werts);
// 	if (max_i>=0){
// 		liste[max_i].push(wort);
// 	}
// }

// for (var i=0;i<16;i++){
// 	liste[i].sort(function(a, b){
// 	  // ASC  -> a.length - b.length
// 	  // DESC -> b.length - a.length
// 	  return a.length - b.length;
// 	});
// 	console.log(i+" "+liste[i][0])
// }


// var liste=[];
// for (var i=0;i<16;i++){
// 	liste.push([]);
// }
// for (var i=0;i<buchstaben.length;i++){
// 	var wort=buchstaben[i];
// 	var freqs = wortFreqs(wort);
// 	var werts=freqs.map(l=>l.length);
// 	var max_i=indexVonEinmaligeMaxzahl(werts);
// 	if (max_i>=0){
// 		liste[max_i].push(wort);
// 	}
// }

// console.log(" ")
// for (var i=0;i<16;i++){
// 	liste[i].sort(function(a, b){
// 	  // ASC  -> a.length - b.length
// 	  // DESC -> b.length - a.length
// 	  return a.length - b.length;
// 	});
// 	console.log(i+" "+liste[i])
// }


//lass Test laufen