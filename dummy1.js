validateITMSchemaOrder()
{
    if(Moment != 'ordering')
	{
		return true;
	}

	dojo.require("dijit.Dialog");
	dojo.ready(function()
	{
	   		
		var form = document.getElementById('serviceForm');
		
		var ccpURL = String(serviceForm.CcpWsEndPointUrl.URL.getValue());
		//var wsaURL = String(serviceForm.PaaSWSAWSEndPointURL.URL.getValue());
        var allDatabase = String(serviceForm.DatabaseSchemaInfoITM.AllDatabases.getValue())
		var imagePath = ccpURL.replace('estore.event','images/progressBar.gif');
		
	  	var waitMsgDialog;
		var xmlDoc = "";
		var xmlDocERP = "";
		var xmlDocNonERP = "";
		var xmlDocPDF = "";
		var xmlDocPDFSchema = "";
		
		// Read XML Data from CreateOrderXML that's been populated dynamically by CCP_Helper_Create_Schema.
		var xmlData = String(serviceForm.DatabaseSchemaUtil.CreateOrderXML.getValue());	
       // var xmlDataERP = String(serviceForm.PaaSWSAUtil.ERP_XML.getValue());
		//var xmlDataNonERP = String(serviceForm.PaaSWSAUtil.NonERP_XML.getValue());
		//var xmlDataPDF = String(serviceForm.PaaSWSAUtil.PDF_XML.getValue());
		//var xmlDataPDFSchema = String(serviceForm.DatabaseSchemaUtil.ModifyServiceXML.getValue());
		
		// Replace <br /> with comma
		var selectedData = String(serviceForm.DatabaseSchemaPrivilegesInfoITM.SpecialPrivilegesConfirmed.getValue());
		selectedData = selectedData.replace(/<br \/>/gi,", ");
		serviceForm.DatabaseSchemaPrivilegesInfoITM.SpecialPrivilegesConfirmed.setValue([[selectedData]]);	
		
		// This is to replace <Value/> with <Value>_REPLACE_</Value>. Will need this if 1st time submit has any validation failure.
		xmlData = xmlData.replace(/<Value><\/Value>/gi,"<Value>_REPLACE_</Value>");
		xmlData = xmlData.replace(/<Value> <\/Value>/gi,"<Value>_REPLACE_</Value>");
		
		//xmlDataPDFSchema = xmlDataPDFSchema.replace(/<Value><\/Value>/gi,"<Value>_REPLACE_</Value>");
		//xmlDataPDFSchema = xmlDataPDFSchema.replace(/<Value> <\/Value>/gi,"<Value>_REPLACE_</Value>");
		
        var dbNameToUpper = String(serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue()).toUpperCase();	
		serviceForm.DatabaseSchemaInfoITM.DatabaseName.setValue([[dbNameToUpper]]);					
		serviceForm.DatabaseSchemaCreateITMSIBD.DatabaseName.setValue([[dbNameToUpper]]);	

        var schemaNameToUpper = String(serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue()).toUpperCase();	
		serviceForm.DatabaseSchemaInfoITM.SchemaName.setValue([[schemaNameToUpper]]);					
		serviceForm.DatabaseSchemaCreateITMSIBD.SchemaName.setValue([[schemaNameToUpper]]);	
		
		var specialPrivileges = String(serviceForm.DatabaseSchemaPrivilegesInfoITM.SpecialPrivileges.getValue());
		var life =String(serviceForm.DatabaseSchemaApplicationInfoITM.LifeCycle.getValue());
		
		if(life == '')
		{
		life = "DEV";
		}
		//alert("life>>"+life)
		if (specialPrivileges != '')
		{			
			var vflag="true";
			serviceForm.DatabaseSchemaPrivilegesInfoITM.PrivilegesApproval.setValue([[vflag]])		}
		else
		{			
			var vflag="false";
			serviceForm.DatabaseSchemaPrivilegesInfoITM.PrivilegesApproval.setValue([[vflag]])			
		}
		
		var tablespaceName="";
		var tablespaceSize="";

		if (trim(String(serviceForm.DatabaseSchemaInfoITM.SchemaType.getValue())) == 'Admin')
		{
                        if (trim(String(serviceForm.DatabaseSchemaInfoITM.isCostCalculatedBeforeSubmit.getValue())) == "false"
			    || trim(String(serviceForm.DatabaseSchemaInfoITM.isCostCalculatedBeforeSubmit.getValue())) == "False"){
				alert("Click on calculate cost button to see the actual cost");
				return false;
                        }

			var rownum = serviceForm.DatabaseSchemaTablespaceGridITM.getGridSize();

			for(var idx = 1; idx<=rownum; idx++) 
			{
				if (trim(String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceName.getCellValue(idx))).length != 0 && trim(String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceSize.getCellValue(idx))).length != 0)
				{
				    if(String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceName.getCellValue(idx)).indexOf(',') > 0)
					{
					  alert("Invalid Tablespace Name ("+String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceName.getCellValue(idx))+").Comma separated Tablespace Name not allowed!");
					  return false;
					}
					if(String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceSize.getCellValue(idx)).indexOf(',') > 0)
					{
					  alert("Invalid Tablespace Size ("+String(serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceSize.getCellValue(idx))+").Comma separated Tablespace Size not allowed!");
					  return false;
					}
					tablespaceName = tablespaceName + serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceName.getCellValue(idx) + ','
					// multiplying 1024 to convert the GB Tablespace Size to MB
					tablespaceSize = tablespaceSize + (1024 * serviceForm.DatabaseSchemaTablespaceGridITM.TablespaceSize.getCellValue(idx)) + ','
				}			
				
			}

			tablespaceName  = trim(tablespaceName);
			tablespaceSize  = trim(tablespaceSize);
			
			if (rownum == 0 || (tablespaceName.length == 0 && tablespaceSize.length == 0))
			{
				 alert("Admin schema cannot be created without providing atleast one Tablespace information.")
				 return false;
			}
			
			tablespaceName = tablespaceName.substring(0,tablespaceName.length-1);
			tablespaceSize = tablespaceSize.substring(0,tablespaceSize.length-1);
		}	

                if(serviceForm.DatabaseSchemaInfoITM.SkipSchemaProvision.getValue() != "Registered"){
                           if (trim(String(serviceForm.DatabaseSchemaInfoITM.SchemaType.getValue())) == 'Admin'){
		    
                                              calculateSchemaCreateStorageCost();
                          }
                 }

		showWait();

		
		if (window.DOMParser)
		{
			parser=new DOMParser();
			xmlDoc=parser.parseFromString(xmlData,"text/xml");
			//xmlDocERP=parser.parseFromString(xmlDataERP,"text/xml");
			//xmlDocNonERP=parser.parseFromString(xmlDataNonERP,"text/xml");
			//xmlDocPDF=parser.parseFromString(xmlDataPDF,"text/xml");
			//xmlDocPDFSchema=parser.parseFromString(xmlDataPDFSchema,"text/xml");
			
		}
		else // Internet Explorer
		{
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(xmlData);
			
			//xmlDocERP=new ActiveXObject("Microsoft.XMLDOM");
			//xmlDocERP.async=false;
			//xmlDocERP.loadXML(xmlDataERP);	
			
			//xmlDocNonERP=new ActiveXObject("Microsoft.XMLDOM");
			//xmlDocNonERP.async=false;
			//xmlDocNonERP.loadXML(xmlDataNonERP);
			
			//xmlDocPDF=new ActiveXObject("Microsoft.XMLDOM");
			//xmlDocPDF.async=false;
			//xmlDocPDF.loadXML(xmlDataPDF);
			
			//xmlDocPDFSchema=new ActiveXObject("Microsoft.XMLDOM");
			//xmlDocPDFSchema.async=false;
			//xmlDocPDFSchema.loadXML(xmlDataPDFSchema);
		} 
  
		// Get <Service>
		var x=xmlDoc.documentElement.childNodes[0].childNodes;
		for (var i=0;i<x.length;i++)
		{
		    
			if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'App_Name')
			{
				//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.ApplicationName.getValue();
				// For Now untils May
				var splitDatabases = allDatabase.split(',')
				var spiltDatabasesArr = Array();
				for (var z=0;z<splitDatabases.length;z++)
				{
				     spiltDatabasesArr.push('CCP_'+splitDatabases[z]+'_'+serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue())
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = spiltDatabasesArr;
					//alert("'CCP_'+splitDatabases[z]+'_'+serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();:::"+spiltDatabasesArr);
				}
				
			}	
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
			{
				//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.Description.getValue();;
				var splitDatabases = allDatabase.split(',')
				var spiltDatabasesArr = Array();
				for (var z=0;z<splitDatabases.length;z++)
				{
				     spiltDatabasesArr.push('CCP-'+splitDatabases[z]+'-'+serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue())
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = spiltDatabasesArr;
					//alert("'CCP_'+splitDatabases[z]+'_'+serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();:::"+spiltDatabasesArr);
				}
				
			}	
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Lifecycle')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = life;
				//alret("x[i].getElementsByTagName("Value")[0].firstChild.nodeValue:::::::::"+life);
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Contact')
			{
				var cont = serviceForm.DatabaseSchemaContactInfoITM.PrimaryContact.getValue();
				if(serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue() != "")
					cont = cont +","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue();
				if(serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue() != "")
					cont = cont +","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue();
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = cont;					
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customer')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.Paas_ITOrgvalue.TeamName.getValue();
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Department')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.Department.getValue();
			}	
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MailerList')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.GroupEmailAlias.getValue();
			}	
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DemandClearingId')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.ProjectID.getValue();
			}	
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ADGroup')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.ADGroup.getValue();
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DutyPager')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.DutyPager.getValue();
			}
			// Set it to false to stop sending emails.
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Notify')
			{
			    //changed to true to handle validation of AD Group.
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'true';
			}			
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'PaaSProjectName')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.ProjectAccount.SelectProjectAccount.getValue();
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ESPSysId')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSOperationalInfo.EMANAppName.getValue();
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DisableProvision')
			{
			     if (serviceForm.DatabaseSchemaInfoITM.SkipSchemaProvision.getValue() == 'Registered')
				 {
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'true';

				 }
				 else
				 {
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'false';

				 }	 
			}
			else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'EnableEditions')
			{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.EnableEditions.getValue();
	 
			}
            else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'RequisitionId')
			{
				x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = '__REQUISITIONID__';
			}
			
			
		}
	
		// Get <Component>
		var y = xmlDoc.documentElement.childNodes[1].childNodes[0].lastChild.childNodes;
    
		// Need to remove Min & Max nodes from xml. 
		// Therefore added in new array.
		var temp = new Array();
		for (var j=3;j<y.length;j++)
		{	
			 temp.push(y[j]);
		}

		for (var k=0;k<temp.length;k++)
		{	
			if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
			}	
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SchemaPwd')
			{
             
                			 
				if (serviceForm.DatabaseSchemaInfoITM.SkipSchemaProvision.getValue() == 'Registered')
				 {
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = '-';

				 }
				 else
				 {
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = document.getElementById('DatabaseSchemaInfoITM.Password').value;

				 }	 			
			}	
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DBName')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.AllDatabases.getValue();
			}	
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SchemaType')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaType.getValue();
			}	
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceName')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.ReportingTablespaceName.getValue();
			}	
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Roles')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.Roles.getValue();
			}							
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceData')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = tablespaceName;
			}
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceDataSize')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = tablespaceSize;
			}
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Cost')
			{
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.CostInformationITM.ServiceCost.getValue();
			}
			else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'AdditionPriv')
			{
			    //alert("Additional Privileges:"+serviceForm.DatabaseSchemaPrivilegesInfoITM.AdditionalPrivileges.getValue());
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaPrivilegesInfoITM.AdditionalPrivileges.getValue();
			}
			 else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SpecialPriv')
			{
				//alert("Special Privileges:"+serviceForm.DatabaseSchemaPrivilegesInfoITM.SpecialPrivileges.getValue());
				temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaPrivilegesInfoITM.SpecialPrivileges.getValue();
			}			
		}
	
		var xmlString = "";
		
		if (window.DOMParser)
		{
			xmlString = (new XMLSerializer()).serializeToString(xmlDoc);
		}
		else // Internet Explorer
		{
			xmlString = xmlDoc.xml;
		}
		xmlString = xmlString.replace(/_REPLACE_/gi,'');
		
		
		// Internally Save the Order XML, will use this to send data to CPO.
		serviceForm.DatabaseSchemaUtil.CreateOrderXML.setValue([[xmlString]]);		
		
		
		var ppostData= 'ccpEvent=order-action&ccpRenderer=data.vm&ccpMainTemplate=&serviceType=SCHEMA&operationType=create&requestType=ValidateOrder&xmldata='+escape(xmlString);

		var xhr = createCORSRequest('POST', ccpURL, ppostData);
		if (!xhr) 
		{
			alert('The Browser that you are using doesnot support PaaS Service Ordering !');
			return;
		}
		// Response handlers.
		xhr.onload = function() 
		{
			var rstxt = xhr.responseText;
			hideWait();
			var data = rstxt + "";
			var repStartIdx = data.indexOf('<Reply>', 0);
			var repEndIdx = data.indexOf('</Reply>', 0);
			var reply = data.substring(repStartIdx, repEndIdx).replace('<Reply>', '');
			if(reply != null && reply != '')
			{
				var statStartIdx = data.indexOf('<Status>', 0);
				var statEndIdx = data.indexOf('</Status>', 0);
				var status = data.substring(statStartIdx, statEndIdx).replace('<Status>', '');
				if(status == 'pass')
				{
				   // var isSRASeled = String(serviceForm.PaaSSRAinfoITM.SRAFlag.getValue());
					//if (isSRASeled == "No")
					//{
						form.submit();   
					//}else
					/*{
					   
					    if (xmlDataERP.length != 0)
						{
						    showWait();
							validateWSAERP(xmlDocERP);
						}	
						
						
					    if (xmlDataNonERP.length != 0)
						{
						    showWait();
							validateWSANonERP(xmlDocNonERP);
						}	
					} */
						
				}
				else if(status == 'validationfail')
				{
				    
					var descStartIdx = data.indexOf('<Description>', 0);
					var descEndIdx = data.indexOf('</Description>', 0);
					var desc = data.substring(descStartIdx, descEndIdx).replace('<Description>', '');
				
					if(desc != null && desc != '')
					{
						alert("Please Fix Following Validation Errors Before Submitting Order : " + desc);
					}						
				}
			}
			else
			{
				alert("An Error Occurred while Submitting Order. Please Try Again or Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !");
			}					
		};
		xhr.onerror = function() 
		{
			hideWait();
			alert("An Error Occurred. Please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !"); 
		};
		
		function validateWSAERP(xmlDocERP)
		{
		    
			// Get <Service>
			var x=xmlDocERP.documentElement.childNodes[0].childNodes;
			for (var i=0;i<x.length;i++)
			{
				
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'App_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();	
					var attrsSrvERP=xmlDocERP.documentElement.childNodes[0].attributes;
					attrsSrvERP.getNamedItem("name").nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
			
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();						
				}
			
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Flow_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.FlowName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Project_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PrjName.getValue();						
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Module_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  serviceForm.PaaSSRAinfoITM.ModName.getValue();
				}			
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customization_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.CustmzName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Contact')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.PrimaryContact.getValue(); // Only one contact CEC ID
					//+","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue()+","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Lifecycle')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.EnvLifecycleSelected.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MAILER_ALIAS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.GroupEmailAlias.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ADGroup')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  serviceForm.DatabaseSchemaContactInfoITM.ADGroup.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customer')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  "PaaS"
					//serviceForm.DatabaseSchemaApplicationInfoITM.ITOrgName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'VERSION_CONTROL')   // Default PVCS
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.VersionCtrlTyp.getValue()
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'EXISTING_VERSION_CTRL_PATH')  //Default N
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PrjVersionCtrl.getValue();;
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'VERSION_CTRL_EXISTING_PROJECT')
				{
					//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppCodeSrvName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_USERNAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppCodeFSOwner.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'APPLICATION_DIRECTORY')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.HomeDir.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_HOST_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbHostName.getValue();  
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_ORACLE_SID')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PORT_NUMBER')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbPort.getValue();  
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_USERNAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbUserName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PASSWORD')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "*****";
					//"Cisco$123";

				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_CONFIRM_PASSWORD')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "*****"
					//"Cisco$123";
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DATABASE_VERSION')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbVersion.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DATABASE_TYPE')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbType.getValue();  
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DATABASE_LINK_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "APPS_"+ serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue(); 
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'JDBC_URL')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "jdbc:oracle:thin:"+serviceForm.PaaSSRAinfoITM.DbHostName.getValue()+":"+serviceForm.PaaSSRAinfoITM.DbPort.getValue()+":"+serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue(); // SID should come
				}		
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_APPROVERS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGApprovers.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_OWNERS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGOwners.getValue();
				}		
			}
			
			
			// Get <Component>
			var y=xmlDocERP.documentElement.childNodes[1].childNodes[0].firstChild.childNodes;

			for (var k=0;k<y.length;k++)
			{
				if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
				{
				    var appCode = String(serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue());
					appCode = appCode.toUpperCase();
					var appCodeStartWith = appCode.substring(0,2);
					
					var attrsCompERP=xmlDocERP.documentElement.childNodes[1].childNodes[0].firstChild.attributes;
					if (appCodeStartWith == "XX")
					{
						y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = appCode;
						attrsCompERP.getNamedItem("name").nodeValue = appCode; 
						
					}
					else
					{
						y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "XX"+appCode;
						attrsCompERP.getNamedItem("name").nodeValue = "XX"+appCode; 
						
					}	
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_BASE_PATH')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.HomeDir.getValue() + "/" +serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_USERNAME')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PASSWORD')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "******";
					//document.getElementById('DatabaseSchemaInfoITM.Password').value;
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_CONFIRM_PASSWORD')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "******";
					//document.getElementById('DatabaseSchemaInfoITM.Password').value;
				}	
			}	


			var xmlStringERP= "";
			var xmlStringERPWithPWD = "";
			if (window.DOMParser)
			{
				xmlStringERP = (new XMLSerializer()).serializeToString(xmlDocERP);
			}
			else // Internet Explorer
			{
				xmlStringERP = xmlDocERP.xml;
			}
			xmlStringERP = xmlStringERP.replace(/_REPLACE_/gi,'');
			
            xmlStringERPWithPWD = xmlStringERP;			
					
			xmlStringERPWithPWD = xmlStringERPWithPWD.replace('<Param><Name>DB_PASSWORD</Name><Value>*****</Value></Param>','<Param><Name>DB_PASSWORD</Name><Value>Cisco#123</Value></Param>');
			
			xmlStringERPWithPWD = xmlStringERPWithPWD.replace('<Param><Name>DB_CONFIRM_PASSWORD</Name><Value>*****</Value></Param>','<Param><Name>DB_CONFIRM_PASSWORD</Name><Value>Cisco#123</Value></Param>');
			
			xmlStringERPWithPWD = xmlStringERPWithPWD.replace('<Param><Name>DB_PASSWORD</Name><Value>******</Value></Param>','<Param><Name>DB_PASSWORD</Name><Value>'+ document.getElementById('DatabaseSchemaInfoITM.Password').value +'</Value></Param>');
			
			xmlStringERPWithPWD = xmlStringERPWithPWD.replace('<Param><Name>DB_CONFIRM_PASSWORD</Name><Value>******</Value></Param>','<Param><Name>DB_CONFIRM_PASSWORD</Name><Value>'+ document.getElementById('DatabaseSchemaInfoITM.Password').value +'</Value></Param>');
			
			
			var ppostData = 'serviceName=SCM_ERP&orderXML='+escape(xmlStringERP);
			
			
			
			var xhrERP = createCORSRequest('POST', wsaURL, ppostData);
			if (!xhrERP) 
			{
				alert('The Browser that you are using doesnot support PaaS Service Ordering !');
				return;
			}
			xhrERP.onload = function() 
			{
				var rstxt = xhrERP.responseText;				
				hideWait();
				var data = rstxt + "";
				
				var repStartIdx = data.indexOf('<Reply>', 0);
				var repEndIdx = data.indexOf('</Reply>', 0);
				var reply = data.substring(repStartIdx, repEndIdx).replace('<Reply>', '');                
				if(reply != null && reply != '')
				{
					var statStartIdx = data.indexOf('<Status>', 0);
					var statEndIdx = data.indexOf('</Status>', 0);
					var status = data.substring(statStartIdx, statEndIdx).replace('<Status>', '');
					//alert("status ERP"+status.toUpperCase())
					if(status.toUpperCase() == 'SUCCESS')
					{
						serviceForm.PaaSWSAUtil.ERP_XML.setValue([[xmlStringERPWithPWD]]);
						
						var isPDFSeled = String(serviceForm.PaaSSRAinfoITM.ProdDataFix.getValue());
						//alert("isPDFSeled"+isPDFSeled)
						if (isPDFSeled == "Yes")
						{
							//alert("xmlDataPDF.length"+xmlDataPDF.length)
							if (xmlDataPDF.length != 0)
							{
							    showWait();
								validateWSAPDF(xmlDocPDF);
							}	  
						}
						else
						{
						    
						    form.submit(); 
						}
					}
					else if(status.toUpperCase() == 'FAIL')
					{
						
						var descStartIdx = data.indexOf('<Description>', 0);
						var descEndIdx = data.indexOf('</Description>', 0);
						var desc = data.substring(descStartIdx, descEndIdx).replace('<Description>', '');
					
						if(desc != null && desc != '')
						{
							alert("Please Fix Following Validation Errors Before Submitting Order : " + desc);
						}						
					}
				}
				else
				{
					alert("An Error Occurred while Submitting Order. Please Try Again or Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !");
				}							
			};
			xhrERP.onerror = function() 
			{
				hideWait();
				alert('An error occurred during order submission, please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !');
			};	
		}
		
		function validateWSANonERP(xmlDocNonERP)
		{
			// Get <Service>
			var x=xmlDocNonERP.documentElement.childNodes[0].childNodes;
			for (var i=0;i<x.length;i++)
			{
				
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'App_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();	
					var attrsSrvNonERP=xmlDocNonERP.documentElement.childNodes[0].attributes;
					attrsSrvNonERP.getNamedItem("name").nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();						
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Contact')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.PrimaryContact.getValue(); // Only one contact CEC ID
					//+","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue()+","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customer')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  "PaaS"
					//serviceForm.DatabaseSchemaApplicationInfoITM.ITOrgName.getValue();
				}			
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Lifecycle')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.EnvLifecycleSelected.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MAILER_ALIAS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.GroupEmailAlias.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ADGroup')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  serviceForm.DatabaseSchemaContactInfoITM.ADGroup.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ERMO_RELEASE')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.EnvERMORels.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SOX_APPLICATION')
				{		
					if(serviceForm.PaaSSRAinfoITM.SOXApp.getValue() == 'Yes')
					{
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "Y";
					}
					else
					{
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "N";
					}
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'PDF_WF_FLAG')
				{
					if(serviceForm.PaaSSRAinfoITM.ProdDataFix.getValue() == 'Yes')
					{
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "Y";
					}
					else
					{
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "N";
					}
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'VERSION_CONTROL')   // Default PVCS
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.VersionCtrlTyp.getValue()
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'EXISTING_VERSION_CTRL_PATH')  //Default N
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PrjVersionCtrl.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'VERSION_CTRL_EXISTING_PROJECT')
				{
					//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppCodeSrvName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_USERNAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppCodeFSOwner.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_BASE_PATH')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.HomeDir.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_HOST_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbHostName.getValue();  
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_ORACLE_SID')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PORT_NUMBER')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbPort.getValue();  
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_USERNAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbUserName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PASSWORD')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "*****";
					//"Cisco$123";

				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DATABASE_TYPE')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DbType.getValue();  
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'JDBC_URL')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "jdbc:oracle:thin:"+serviceForm.PaaSSRAinfoITM.DbHostName.getValue()+":"+serviceForm.PaaSSRAinfoITM.DbPort.getValue()+":"+serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue(); // SID should come
				}		
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MIGRATE_OPTION')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.SQLFileMig.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'FILE_TYPES')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.FileTypeExtn.getValue();
				}	
						
			}

			// Get <Component>
			var y=xmlDocNonERP.documentElement.childNodes[1].childNodes[0].firstChild.childNodes;

			for (var k=0;k<y.length;k++)
			{
				if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
					var attrsCompNonERP1=xmlDocNonERP.documentElement.childNodes[1].childNodes[0].firstChild.attributes;
					attrsCompNonERP1.getNamedItem("name").nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue(); //Check whether XX need to be prefixed for AppCode against schema
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DESCRIPTION')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'CONTACT')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.PrimaryContact.getValue(); 
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'NAMING_STANDARDS')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.NamingSTD.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SUB_PATH')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.SubPath.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SOX_APPLICATION')
				{
					if(serviceForm.PaaSSRAinfoITM.SOXApp.getValue() == 'Yes')
					{
						y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "Y";
					}
					else
					{
						y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "N";
					}
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'CODE_FREEZE')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppCodeFreeze.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DOWNTIME')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.DownTime.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'APPCODES')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_APPROVERS')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGApprovers.getValue();
				}
				else if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_OWNERS')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGOwners.getValue();
				}	
				
				
			}	
			
			
			
			var z=xmlDocNonERP.documentElement.childNodes[1].childNodes[1].firstChild.childNodes;

			for (var j=0;j<z.length;j++)
			{
				if(z[j].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
				{
					z[j].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
					var attrsCompNonERP2=xmlDocNonERP.documentElement.childNodes[1].childNodes[1].firstChild.attributes;
					attrsCompNonERP2.getNamedItem("name").nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue(); //Check whether XX need to be prefixed for AppCode against schema
				}
				else if(z[j].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					z[j].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				else if(z[j].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SERVER_BASE_PATH')
				{
					z[j].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.HomeDir.getValue() + "/" +serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
				}
				else if(z[j].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_USERNAME')
				{
					z[j].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.SchemaName.getValue();
				}
				else if(z[j].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DB_PASSWORD')
				{
					z[j].getElementsByTagName("Value")[0].firstChild.nodeValue = "******";
					//document.getElementById('DatabaseSchemaInfoITM.Password').value;
				}
				
				
			}


			var xmlStringNonERP = "";
			var xmlStringNonERPWithPWD = "";
			if (window.DOMParser)
			{
				xmlStringNonERP = (new XMLSerializer()).serializeToString(xmlDocNonERP);
			}
			else // Internet Explorer
			{
				xmlStringNonERP = xmlDocNonERP.xml;
			}
			xmlStringNonERP = xmlStringNonERP.replace(/_REPLACE_/gi,'');
			
			xmlStringNonERPWithPWD = xmlStringNonERP;
			
			xmlStringNonERPWithPWD = xmlStringNonERPWithPWD.replace('<Param><Name>DB_PASSWORD</Name><Value>*****</Value></Param>','<Param><Name>DB_PASSWORD</Name><Value>Cisco#123</Value></Param>');
			
			xmlStringNonERPWithPWD = xmlStringNonERPWithPWD.replace('<Param><Name>DB_PASSWORD</Name><Value>******</Value></Param>','<Param><Name>DB_PASSWORD</Name><Value>'+ document.getElementById('DatabaseSchemaInfoITM.Password').value +'</Value></Param>');
			
			
					
			var ppostData= 'serviceName=SCM_CDWFS&orderXML='+ escape(xmlStringNonERP);
			
			
			
			var xhrNonERP = createCORSRequest('POST', wsaURL, ppostData);
			if (!xhrNonERP) 
			{
				alert('The Browser that you are using doesnot support PaaS Service Ordering !');
				return;
			}
			xhrNonERP.onload = function() 
			{
				var rstxt = xhrNonERP.responseText;				
				hideWait();
				var data = rstxt + "";
				var repStartIdx = data.indexOf('<Reply>', 0);
				var repEndIdx = data.indexOf('</Reply>', 0);
				var reply = data.substring(repStartIdx, repEndIdx).replace('<Reply>', '');                
				if(reply != null && reply != '')
				{
					var statStartIdx = data.indexOf('<Status>', 0);
					var statEndIdx = data.indexOf('</Status>', 0);
					var status = data.substring(statStartIdx, statEndIdx).replace('<Status>', '');
					//alert("status NonERP"+status.toUpperCase())
					if(status.toUpperCase() == 'SUCCESS')
					{
						serviceForm.PaaSWSAUtil.NonERP_XML.setValue([[xmlStringNonERPWithPWD]]);
						var isPDFSeled = String(serviceForm.PaaSSRAinfoITM.ProdDataFix.getValue());
						//alert("isPDFSeled"+isPDFSeled)
						if (isPDFSeled == "Yes")
						{
							//alert("xmlDataPDF.length"+xmlDataPDF.length)
							if (xmlDataPDF.length != 0)
							{
							    showWait();
								validateWSAPDF(xmlDocPDF);
							}	  
						}
						else
						{
							form.submit(); 
						}
					}
					else if(status.toUpperCase() == 'FAIL')
					{
						
						var descStartIdx = data.indexOf('<Description>', 0);
						var descEndIdx = data.indexOf('</Description>', 0);
						var desc = data.substring(descStartIdx, descEndIdx).replace('<Description>', '');
					
						if(desc != null && desc != '')
						{
							alert("Please Fix Following Validation Errors Before Submitting Order : " + desc);
						}						
					}
				}
				else
				{
					alert("An Error Occurred while Submitting Order. Please Try Again or Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !");
				}							
			};
			xhrNonERP.onerror = function() 
			{
				hideWait();
				alert('An error occurred during order submission, please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !');
			};		
		}
		
		function validateWSAPDF(xmlDocPDF)
		{
			// Get <Service>
			var x=xmlDocPDF.documentElement.childNodes[0].childNodes;
			for (var i=0;i<x.length;i++)
			{
				
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Kind_of_Workflow')
				{
					//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFWorkFlowKind.getValue();
					if (String(serviceForm.PaaSSRAinfoITM.ERPFlag.getValue()) == "ERP")
					{
						
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "ERP 11i Dynamic Workflow";
					}
					if (String(serviceForm.PaaSSRAinfoITM.ERPFlag.getValue()) == "NonERP")
					{
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "Cisco Dynamic Workflow";
					}
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Track_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Flow_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'App_Name')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
					var attrsSrvPDF=xmlDocPDF.documentElement.childNodes[0].attributes;
					attrsSrvPDF.getNamedItem("name").nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue(); //Check whether XX need to be prefixed for AppCode against schema
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.AppName.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Contact')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFContact.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customer')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = "PaaS"
					//serviceForm.DatabaseSchemaApplicationInfoITM.ITOrgName.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Lifecycle')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.EnvLifecycleSelected.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MAILER_ALIAS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFEmailAlisa.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ADGroup')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFADGroup.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DATABASE_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue()
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SCHEMA_NAME')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFSchemaName.getValue();
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_APPROVERS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGApprovers.getValue()
				}
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ONRAMP_OWNERS')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.WSGOwners.getValue();
				}
							
			}

			// Get <Component>
			var y=xmlDocPDF.documentElement.childNodes[1].childNodes[0].firstChild.childNodes;

			for (var k=0;k<y.length;k++)
			{
				if(y[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
				{
					y[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFWorkFlowType.getValue();
					var attrsCompPDF=xmlDocPDF.documentElement.childNodes[1].childNodes[0].firstChild.attributes;
					attrsCompPDF.getNamedItem("name").nodeValue = serviceForm.PaaSSRAinfoITM.PDFWorkFlowType.getValue(); //Check whether XX need to be prefixed for AppCode against schema
				}
				
				
			}	
			
			
			var xmlStringPDF = "";
			if (window.DOMParser)
			{
				xmlStringPDF = (new XMLSerializer()).serializeToString(xmlDocPDF);
			}
			else // Internet Explorer
			{
				xmlStringPDF = xmlDocPDF.xml;
			}
			xmlStringPDF = xmlStringPDF.replace(/_REPLACE_/gi,'');
					
			var ppostData= 'serviceName=SCM_PDF&orderXML='+ escape(xmlStringPDF);
			
			
			var xhrPDF = createCORSRequest('POST', wsaURL, ppostData);
			if (!xhrPDF) 
			{
				alert('The Browser that you are using doesnot support PaaS Service Ordering !');
				return;
			}
			xhrPDF.onload = function() 
			{
				var rstxt = xhrPDF.responseText;				
				hideWait();
				var data = rstxt + "";
				//alert("PDF"+data)
				var repStartIdx = data.indexOf('<Reply>', 0);
				var repEndIdx = data.indexOf('</Reply>', 0);
				var reply = data.substring(repStartIdx, repEndIdx).replace('<Reply>', '');                
				if(reply != null && reply != '')
				{
					var statStartIdx = data.indexOf('<Status>', 0);
					var statEndIdx = data.indexOf('</Status>', 0);
					var status = data.substring(statStartIdx, statEndIdx).replace('<Status>', '');
					//alert("status PDF"+status.toUpperCase())
					if(status.toUpperCase() == 'SUCCESS')
					{
						serviceForm.PaaSWSAUtil.PDF_XML.setValue([[xmlStringPDF]]);
						//alert("serviceForm.PaaSSRAinfoITM.isPDFSchemaNameExists.getValue()"+serviceForm.PaaSSRAinfoITM.isPDFSchemaNameExists.getValue())
						if (serviceForm.PaaSSRAinfoITM.isPDFSchemaNameExists.getValue() == 0)
						{
						    showWait();
							validatePDFSchema(xmlDocPDFSchema)
						}
						else
						{
							form.submit();   
						}	
					}
					else if(status.toUpperCase() == 'FAIL')
					{
						
						var descStartIdx = data.indexOf('<Description>', 0);
						var descEndIdx = data.indexOf('</Description>', 0);
						var desc = data.substring(descStartIdx, descEndIdx).replace('<Description>', '');
					
						if(desc != null && desc != '')
						{
							alert("  " + desc);
						}						
					}
				}
				else
				{
					alert("An Error Occurred while Submitting Order. Please Try Again or Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !");
				}							
			};
			xhrPDF.onerror = function() 
			{
				hideWait();
				alert('An error occurred during order submission, please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !');
			};	
		}

		function validatePDFSchema(xmlDocPDFSchema)
		{
			// Get <Service>
			var x=xmlDocPDFSchema.documentElement.childNodes[0].childNodes;
			for (var i=0;i<x.length;i++)
			{
				if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'App_Name')
				{
					
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'CCP_'+serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue()+'_'+serviceForm.PaaSSRAinfoITM.PDFSchemaName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Description')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'CCP-'+serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue()+'-'+serviceForm.PaaSSRAinfoITM.PDFSchemaName.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Lifecycle')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.LifeCycle.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Contact')
				{
					//var contPFD = "apriydar,adrona,rturlapa"
					
					
					var contPFD  = serviceForm.PaaSSRAinfoITM.PDFContact.getValue();
					if(serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue() != "")
						contPFD = contPFD +","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact1.getValue();
					if(serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue() != "")
						contPFD = contPFD +","+serviceForm.DatabaseSchemaContactInfoITM.SecondaryContact2.getValue();
					
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = contPFD;					
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Customer')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue =  serviceForm.Paas_ITOrgvalue.TeamName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Department')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.Department.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'MailerList')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFEmailAlisa.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DemandClearingId')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaApplicationInfoITM.ProjectID.getValue();
				}	
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'ADGroup')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFADGroup.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DutyPager')
				{
					//x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaContactInfoITM.DutyPager.getValue();
				}
				// Set it to false to stop sending emails.
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Notify')
				{
					//changed to true to handle validation of AD Group.
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'true';
				}			
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'PaaSProjectName')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.ProjectAccount.SelectProjectAccount.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'EMANProjectName')
				{
					x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSOperationalInfo.EMANAppName.getValue();
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DisableProvision')
				{
					 /*
					 if (serviceForm.DatabaseSchemaInfoITM.SkipSchemaProvision.getValue() == 'Registered')
					 {
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'true';

					 }
					 else
					 {
					 */
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = 'false';
					/*
					 }	
					*/				 
				}
				else if(x[i].getElementsByTagName("Name")[0].firstChild.nodeValue == 'EnableEditions')
				{
					 
						x[i].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.EnableEditions.getValue();			 
				}
				
			}

			// Get <Component>
			var y = xmlDocPDFSchema.documentElement.childNodes[1].childNodes[0].lastChild.childNodes;

			// Need to remove Min & Max nodes from xml. 
			// Therefore added in new array.
			var temp = new Array();
			for (var j=3;j<y.length;j++)
			{	
				 temp.push(y[j]);
			}

			for (var k=0;k<temp.length;k++)
			{	
				if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Name')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.PaaSSRAinfoITM.PDFSchemaName.getValue();
				}	
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SchemaPwd')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "Cisco#123"
				}	
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'DBName')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.DatabaseSchemaInfoITM.DatabaseName.getValue();
				}	
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'SchemaType')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "Reporting";
				}	
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceName')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "CSCO_USERS"
				}	
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Roles')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "CISCO_STD_USER"
				}							
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceData')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue =  "CSCO_USERS";
				}
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'TablespaceDataSize')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = "0";
				}
				else if(temp[k].getElementsByTagName("Name")[0].firstChild.nodeValue == 'Cost')
				{
					temp[k].getElementsByTagName("Value")[0].firstChild.nodeValue = serviceForm.CostInformationITM.ServiceCost.getValue();
				}
						
			}

			var xmlStringPDFSchema= "";

			if (window.DOMParser)
			{
				var xmlStringPDFSchema = (new XMLSerializer()).serializeToString(xmlDocPDFSchema);
			}
			else // Internet Explorer
			{
				var xmlStringPDFSchema = xmlDocPDFSchema.xml;
			}
			xmlStringPDFSchema = xmlStringPDFSchema.replace(/_REPLACE_/gi,'');
			
			
			// Internally Save the Order XML, will use this to send data to CPO.
			serviceForm.DatabaseSchemaUtil.ModifyServiceXML.setValue([[xmlStringPDFSchema]]);
				
				
						
			var ppostData='ccpEvent=order-action&ccpRenderer=data.vm&ccpMainTemplate=&serviceType=SCHEMA&operationType=create&requestType=ValidateOrder&xmldata='+escape(xmlStringPDFSchema);

			var xhrPDFSchema = createCORSRequest('POST', ccpURL, ppostData);
			if (!xhrPDFSchema) 
			{
				alert('The Browser that you are using doesnot support PaaS Service Ordering !');
				return;
			}
			// Response handlers.
			xhrPDFSchema.onload = function() 
			{
				var rstxt = xhrPDFSchema.responseText;
				hideWait();
				var data = rstxt + "";
				//alert("PDFSchema"+data)
				var repStartIdx = data.indexOf('<Reply>', 0);
				var repEndIdx = data.indexOf('</Reply>', 0);
				var reply = data.substring(repStartIdx, repEndIdx).replace('<Reply>', '');
				if(reply != null && reply != '')
				{
					var statStartIdx = data.indexOf('<Status>', 0);
					var statEndIdx = data.indexOf('</Status>', 0);
					var status = data.substring(statStartIdx, statEndIdx).replace('<Status>', '');
					//alert("status PDFSchema"+status.toUpperCase())
					if(status == 'pass')
					{
								
							form.submit();  		
					}
					else if(status == 'validationfail')
					{
						
						var descStartIdx = data.indexOf('<Description>', 0);
						var descEndIdx = data.indexOf('</Description>', 0);
						var desc = data.substring(descStartIdx, descEndIdx).replace('<Description>', '');
						var schemaAlreadyExists = desc.indexOf('Schema already exists on selected Database');
					    //alert("schemaAlreadyExists"+schemaAlreadyExists)
						if (schemaAlreadyExists > 0)
						{
						    //alert("before"+xmlStringPDFSchema)
						    xmlStringPDFSchema = xmlStringPDFSchema.replace('<Param><Name>DisableProvision</Name><Title>Do you want to Disable Provision</Title><Id>1687</Id><Permission>w</Permission><UIType>Checkbox</UIType><DataType>Str</DataType><Required>false</Required><DefValue>false</DefValue><Value>false</Value></Param>','<Param><Name>DisableProvision</Name><Title>Do you want to Disable Provision</Title><Id>1687</Id><Permission>w</Permission><UIType>Checkbox</UIType><DataType>Str</DataType><Required>false</Required><DefValue>false</DefValue><Value>true</Value></Param>');
						    serviceForm.DatabaseSchemaUtil.ModifyServiceXML.setValue([[xmlStringPDFSchema]]);
							//alert("after"+xmlStringPDFSchema)
							form.submit();
						}
						else if(desc != null && desc != '')
						{
							alert("Please Fix Following Validation Errors Before Submitting Order : " + desc);
						}						
					}
				}
				else
				{
					alert("An Error Occurred while Submitting Order. Please Try Again or Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !");
				}					
			};
			xhrPDFSchema.onerror = function() 
			{
				hideWait();
				alert("An Error Occurred. Please Contact CITEIS PaaS Support Team(citeis-paas-support@cisco.com) !"); 
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
			var strContent = "<table border='1' bgcolor='2F8081'><tr><td><center><font color='FFFFFF'>Validating Order .... Please wait !</font><br><br><IMG src='"+imagePath+"' /></center></td></tr></table>";				
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
		
		/*** Numberic validation ***/
		function IsNumeric(input)
		{ 
			var RE = /^-{0,1}\d*\.{0,1}\d+$/;     
			return (RE.test(input)); 
		} 
		
		/*** Trim spaces from string ***/
		function trim(myString)     
		{     
			return myString.replace(/^s+/g,'').replace(/s+$/g,'');     
		}
	});
	return false;
}