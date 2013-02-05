GMN.Stats.updateGraph = function(_options){
	var options = {
		"refreshInterval":1000,
		"graph":0,//0 : 30 seconds, 1 : 30 minutes, 2 : 24 hours
		"Yamount":5
	}
	var refreshTime,
		started = false;

	for(var option in _options) {
		options[option] = _options[option];
	}
	
	var updateGraphs = function() {
		GMN.Stats.getStats(function(data,status){
			if(status === 200) {
				$(".error").hide();
				drawGraph(data);
			} else {
				stop();
				//Despues hacer bien el "logout"
				$("#canvas").hide();
				$("#boardContainer").hide();
				$("#loginContainer").show();
				$(".error").text("ERROR " + status + ": " + data.message).show();
			}
			if(started) {
				refreshTime = setTimeout(updateGraphs, options.refreshInterval);
			} else {
				console.log("stoped");
			}
		});
	}
		
	var drawGraph = function(data){
		var params = {
			"Ytext":"",
			"Xtext":"",
			"Yscale":"",
			"Xscale":"",
			"stats":[],
		};
		
		var setParams = function(_params){
			for(var option in _params) {
				params[option] = _params[option];
			}
		};
		

		//Seleccion de datos segun tipo de grafico
		switch(options.graph){
			case 0:
				var biggest = 0;//Consigo el numero mas grande para hacer la escala del grafico
				for(var i = 0;i<data.Seconds.length;i++)
					biggest = biggest < data.Seconds[i] ? data.Seconds[i] : biggest;
				setParams({"Ytext":"Requests per second","Xtext":"Seconds ago","Yscale":(biggest+(biggest/4)),"Xscale":60,"stats":data.Seconds});
				break;
			case 1:
				var biggest = 0;//Consigo el numero mas grande para hacer la escala del grafico
                var tmp = data.Minutes.slice(0,60);
				for(var i = 0;i<tmp.length;i++)
					biggest = biggest < tmp[i] ? tmp[i] : biggest;
				setParams({"Ytext":"Requests per minute","Xtext":"Minutes ago","Yscale":(biggest+(biggest/4)),"Xscale":60,"stats":tmp});
				break;
			case 2:
	            var res = [];
				var biggest = 0;//Consigo el numero mas grande para hacer la escala del grafico
                //60 * 24 = 1440
                for(var i =0;i<(data.Minutes.length/60);i++){
                    var tmp = data.Minutes.slice(i*60,(i*60)+59), suma = 0;
                    for(var a = 0;a<tmp.length;a++)
                        suma += tmp[a];
                    res.push(suma);
                }
				for(var i = 0;i<res.length;i++)
					biggest = biggest < res[i] ? res[i] : biggest;
				setParams({"Ytext":"Requests per hour","Xtext":"Hours ago","Yscale":(biggest+(biggest/4)),"Xscale":24,"stats":res});
		};
		
		//Ajuste de los textos
		$("#Ytext").text(params.Ytext);
		
		var output = [],i = options.Yamount-1,calc = 1,height = parseInt($("#myCanvas").css('height')),off = (height / options.Yamount);
		while(calc > 0){
			calc = (Math.floor((((params.Yscale/5)*4)/(options.Yamount-1))*i));	//Ajusto la escala vertical
			if($.inArray(calc,output) == -1)
				output.push(calc)
			i--;
		}
		
		
		$("#Yscale").text(output.join("\n"))
						.css({//		   (lugar a cubrir - (tamaño de chars   / cantidad de chars))+char/rem
							'line-height':(((((height-off)-((output.length)*6))/(output.length-1))+6)/16)+'rem',
							'width':((Math.floor(params.Yscale)+"").length * 0.66)+'rem',
							'margin-top':(off+20-((((height-off)-((output.length)*6))/(output.length-1))/2))+"px"
						});
		output = "";
		for(var i = params.stats.length;i>=1;i-=3)
			output += i + " ";
		output += 0;
		$("#Xscale").text(output)
						.css({		       //50(rems del largo del canvas) - (cantidad de rem ocupadas por chars en la escala) / (cantidad de anotaciones en la escala)               ----0.017
							'word-spacing':((50-((((params.stats.length/3)+1)*(1 + (0.01 * (params.stats.length+1))))-5))   /((params.stats.length/3)+1))+'rem',//Esto sirve para centrar la escala con word spacing y que el maximo y el minimo queden en las esquinas
						});
		$("#Xtext").text(params.Xtext);
		
		//Creo devuelta el canvas para poder limpiarlo y evitar problemas de stretching por el tamaño definido al crearlo. Mas explicaciones abajo.
		$("#myCanvas").replaceWith('<canvas id="myCanvas" height="'+$("#myCanvas").css('height')+'" width="'+$("#myCanvas").css('width')+'">Tu browser no soporta HTML5, deja de usar IE7.</canvas>');
					//Seteo el height y width como atributo(usando el mismo que en el CSS) porque el canvas los usa como coordenadas de dibujo y escala.
					//CSS solo cambia el tamaño de la caja y hace que se vea zoomeado. 
				
		//Opciones de dibujo
		var offset = {};
		offset.y = $("#myCanvas").height();//Offset vertical para no tener que calcular la altura al revez.
		offset.x = $("#myCanvas").width();//Offset horizontal para poder graficar de izquierda a derecha
		scale = {};
		scale.x = (offset.x / (params.Xscale-1));//Consigo la distancia que necesito desplazar el cursor horizontalmente (ancho de canvas / puntos de datos)
		scale.y = (offset.y / params.Yscale);//Lo mismo que arriba pero para el vertical
		var c=document.getElementById("myCanvas");
		var ctx=c.getContext("2d");
		ctx.lineWidth=1;//Defino las opciones del trazado
		ctx.lineJoin="round";
		
		//Fondo
		var myGradient = ctx.createLinearGradient(0, 240, 0, 0);
		myGradient.addColorStop(0, "#E0E0E0");
		myGradient.addColorStop(1, "#F3F3F3");
		ctx.fillStyle = myGradient;
		ctx.fillRect(0, 0, $("#myCanvas").width(), $("#myCanvas").height());

		//Lineas guia
		ctx.beginPath();
		for(var i = 0;i<options.Yamount;i++){
			ctx.moveTo(0,offset.y-((offset.y/options.Yamount)*i));
			ctx.lineTo(offset.x,offset.y-((offset.y/options.Yamount)*i));
		}
		ctx.strokeStyle="#B8B894";
		ctx.stroke();//Trazo la linea
		ctx.closePath();
		
		//Dibujado del grafico
		ctx.beginPath();
		ctx.moveTo(0+offset.x,0+offset.y);//Muevo el cursor al principio del grafico (empiezo en la esquina inferior derecha)
		for(var i = 0;i<params.stats.length;i++){
			ctx.lineTo(offset.x-(scale.x*i),offset.y-(scale.y*params.stats[i]));//Trazo las lineas segun la informacion
		}
		ctx.lineTo(0,0+offset.y);//Posiciono el cursor en linea con el punto inicial
		ctx.closePath();//Cierro el dibujo
		ctx.strokeStyle="#6666FF";
		ctx.stroke();//Trazo la linea
		
		ctx.fillStyle="#C2C2FF";
		ctx.globalAlpha=0.5;
		ctx.fill(); 
	}


	var start = function() {
		started = true;
		console.log("Starting graph");
		refreshTime = setTimeout(updateGraphs, options.refreshInterval);
	}

	var stop = function() {
		started = false;
		console.log("stoping");
		clearTimeout(refreshTime);
	}

    var setMode = function(mode){
        options.graph = mode;        
    }

	return {
		"start":start,
		"stop":stop,
        "setMode":setMode
	}
}
