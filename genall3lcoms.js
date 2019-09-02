var buchstaben=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

for (var i=0;i<26;i++){
	var c1 = buchstaben[i];
	console.log(c1);
	for (var j=i;j<26;j++){
		var c2 = buchstaben[j];
		console.log(c1+c2)
		for (var k=j;k<26;k++){
			var c3 = buchstaben[k];
			console.log(c1+c2+c3)
		}
		
	}
}
