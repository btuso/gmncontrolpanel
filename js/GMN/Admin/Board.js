GMN.Admin.Board = function(_options) {
	var options = {
			"refreshBoardInterval":1000
		}

	var boardTimer,
		started = false;

	for(var option in _options) {
		options[option] = _options[option];
	}

	var getData = function(callback) {
		$.ajax({
			"url": GMN.Server.Config.getServer() + ":" + GMN.Server.Config.getPort() + "/admin/board/" + GMN.Server.Config.getAdminPassword(),
			"complete": function(data) {
				var msg = data.responseText ? JSON.parse(data.responseText) : {error:'0', message:'unhandled error'};
				callback(msg,data.status);
			}
		})
	}

	var refreshBoard = function() {
		getData(function(data,status){
			console.log(status);
			if(status === 200) {
				console.log(data);
				$(".error").hide();
				var source = $("#board").html();
				var template = Handlebars.compile(source);
				for(var i = 0; i < data.players.length; i++) data.players[i].serverTime = data.stats.serverTime;
				var html = template(data);
				$(".boardTableContainer").html(html);



			} else {
				stop();
				$("#startButton").removeAttr("disabled");
				$("#stopButton").attr("disabled", "disabled");
				$("#boardContainer").hide();
				$("#loginContainer").show();
				$(".error").text("ERROR " + status + ": " + data.message).show();
			}
			if(started) {
				boardTimer = setTimeout(refreshBoard, options.refreshBoardInterval);
			} else {
				console.log("stoped");
			}
		});
	}

	var reset = function() {
        var Url = GMN.Server.Config.getServer() + ":" + GMN.Server.Config.getPort() + "/admin/reset/" + GMN.Server.Config.getAdminPassword();
        var Request = $.ajax({ type: "GET", url: Url, dataType: "json" });

        Request.done(function(response) {
        	alert("Se ha reiniciado el tablero correctamente.");
        })

        Request.fail(function(jqXHR, textStatus) {
            if(jqXHR.status == 401)
                alert("La contraseña de administrador es incorrecta.");
            else
                alert("Error desconocido. Numero de error: " + jqXHR.status);
        })
	}

	var start = function() {
		started = true;
		console.log("starting");
		boardTimer = setTimeout(refreshBoard, options.refreshBoardInterval);
	}

	var stop = function() {
		started = false;
		console.log("stoping");
		clearTimeout(boardTimer);
	}

	return {
		"start":start,
		"stop":stop,
		"reset":reset
	}
}
