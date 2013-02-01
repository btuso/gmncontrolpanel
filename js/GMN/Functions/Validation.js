/*-----Validacion del servi_optionsdor y puerto-----*/
				/*--Funcion de checkeo de respuesta de server--*/
				var checkServer = function(){
					$.ajax({
						type: "GET",
						timeout: 2000,
						url: $("#serverName").val() + ':' + $("#serverPort").val() + '/version',
						async: true,
						success: function(data,status,xhr){
							if(xhr.readyState == 4)
								if(xhr.status == 200)
								{
									$("#serverName").css({'background-color' : '#6EDA60'});
									$("#serverPort").css({'background-color' : '#6EDA60'});
								}
						},
						error: function(jqXHR){
							if(jqXHR.readyState <= 0)
								{
									$("#serverName").css({'background-color' : '#FF6666'});
									$("#serverPort").css({'background-color' : '#FF6666'});
								}
						}
					});
				}
				/*--Fin de funcion de checkeo--*/
				/*---Inicio de validacion servidor---*/
				var validateServer = function(){
					if ($("#serverName").val().indexOf("http://") !== 0)
            			$("#serverName").val("http://" + $("#serverName").val());
            		if($("#serverName").val().substring($("#serverName").val().length - 1) == "/")
						$("#serverName").val($("#serverName").val().substring(0, $("#serverName").val().length - 1));
				}
    			/*---Fin de validacion servidor---*/
    			/*---Inicio de validacion puerto // permitir solo escribir numeros---*/
    			onlyNumbers  = function(evt){
    				var keyPressed = (evt.which) ? evt.which : evt.keyCode
					return !(keyPressed > 31 && (keyPressed < 48 || keyPressed > 57));
    			}
    			/*---Fin de validacion puerto---*/
    			/*--------*/