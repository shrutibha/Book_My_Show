validateSchemaNameAsCECId()
{
    var dbs = serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue()  +',' +serviceForm.DatabaseSchemaInfoITM.AddtionalDBToBeProvisioned.getValue()
        
    dojo.require("dijit.Dialog");
    dojo.ready(function()
    {
        
	//var ccpURL = "http://wwwin-tools-dev.cisco.com/portal/main.event";
	var ccpURL = String(serviceForm.CcpWsEndPointUrl.URL.getValue());

	//http://wwwin-tools.cisco.com/portal/images/progressBar.gif
	var imagePath = ccpURL.replace('estore.event','images/progressBar.gif');
	var waitMsgDialog;				

	var form = document.getElementById('serviceForm');		
	cecIds = String(serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue());
	if(cecIds != null && cecIds != "")
	{
		showWait();				
		var postData = "ccpEvent=miscellaneous-action&ccpRenderer=data.vm&ccpMainTemplate=&params="+cecIds+"&requestType=ValidateCecIds";
                var ccpURL = String(serviceForm.CcpWsEndPointUrl.URL.getValue());
				
		var invalidUsers ="";
		var invalidFlag= false;
				
		var xhr1 = createCORSRequest('POST', ccpURL, postData);
		if (!xhr1) 
		{
			alert('The Browser that you are using doesnot support PaaS Service Ordering !');
			return;
		}
		// Response handlers.
		xhr1.onload = function() 
		{
			var rstxt1 = xhr1.responseText;
			hideWait();
			var data = rstxt1 + "";
			var userIdTokens = data.split(',');
			for ( var i = 0; i < userIdTokens.length; i++ )
			{
				var statusTokens = userIdTokens[i].split(':');
				if(statusTokens[1] == 'invalid')
				{
					  invalidUsers = statusTokens[0] + "," +invalidUsers;
					  invalidFlag = true;
				}
			}
			if(invalidFlag)
			{
				//alert (" Following CEC User Ids are invalid - [ " + invalidUsers  + " ]. Please Provide valid CEC User Ids !");
				serviceForm.DatabaseSchemaInfoITM.validCECId.setValue([["Invalid"]]);						
			}
			else
			{		
				//alert (" Following CEC User Ids are invalid - [ " + invalidUsers  + " ]. Please Provide valid CEC User Ids !");
				serviceForm.DatabaseSchemaInfoITM.validCECId.setValue([["Valid"]]);		
			}					
		};
		xhr1.onerror = function() 
		{
			hideWait();
			alert('An error occurred during order submission, please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !');
		};
	}
	/*** Show Wait Popup ***/
	function showWait()
	{
		waitMsgDialog = new dijit.Dialog({
		    id: "waitDialogId",
		    title: "",
		    width: "100px"
	        });		
	        var strContent = "<table border='1' bgcolor='2F8081'><tr><td><center><font color='FFFFFF'>Validating schema name .... Please wait !</font><br><br><IMG src='"+imagePath+"' /></center></td></tr></table>";				
	        waitMsgDialog.attr("content", strContent);
	        waitMsgDialog.show();
        }
	
	/*** Hide Wait Popup ***/
	function hideWait()
	{
		/*waitMsgDialog.hide();
		waitMsgDialog.destroy();*/
			
		if(dijit.byId('waitDialogId'))
		{
			dijit.byId('waitDialogId').destroy(); 
		}
	}

        //validate DB status
        var postData="ccpEvent=miscellaneous-action&ccpRenderer=data.vm&ccpMainTemplate=&requestType=ValidateDBConnection&params="+dbs
        var db_stat = createCORSRequest('POST', ccpURL, postData);       
	if (!db_stat) 
	{
		alert('The Browser that you are using doesnot support PaaS Service Ordering !');
		return;
	}
	// Response handlers.
	db_stat.onload = function() 
	{
		var dbtxt = db_stat.responseText;
		hideWait();
		var data = dbtxt.split(',');
	        for ( var i = 0; i < dbtxt.split(',').length-1; i++ )
		{ 
                        if (data[i].split('=')[1] == 'INVALID')
                        {
                             alert(data[i].split('=')[0] +" database is not available")
                        }
                }
	};
	db_stat.onerror = function() 
	{
		hideWait();
		alert('An error occurred during order submission, please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !');
	};
   });
   return false;
}