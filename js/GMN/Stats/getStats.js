GMN.Stats.getStats = function(callback) {
		$.ajax({
			"url": GMN.Server.Config.getServer() + ":" + GMN.Server.Config.getPort() + "/admin/stats/" + GMN.Server.Config.getAdminPassword(),
			"complete": function(data) {
				var msg = data.responseText ? JSON.parse(data.responseText) : {error:'0', message:'unhandled error'};
				callback(msg,data.status);
			}
		})
}
