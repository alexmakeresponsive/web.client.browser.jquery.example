let AutocompleteData = {
	listKeyCode: [],
	listTimerId: [],
	dataXhr: {
		location:    {
            name: "",
            id:   2300000700000,
		},
        userInput: "",
	}
};

const AutocompleteConfiguration = {
	URL: {
		XHR: "ajax/api/dadata/entry.php"
	},
	REGEXP: [
        new RegExp('^[а-яА-яё\-\\s0-9.,N№\/]{1,}$', ''),
    ],
    REGEXP_EXEPTION: [
        
    ],
	DATA: {
		DELIMETER: {
			DEFAULT: " ",
            STREET_NAME_AFTER: ",",
            STREET_TYPE_AFTER: ".",
		}
	},
	TEXT: {
		dropdown: {
			noResults: "Нет результатов"
		}
	},
	INTERRUPT: {
		KEYBOARD: {
			SKIP_LIST: [
				37, 38, 39, 40,	// Arrows
				17, 18,			// Ctrl, Alt
				16				// Shift
			]
		},
        TIMEOUT: {
            main: 900,
        }
	},
	
};

function renderAutocompleteCheckByRegex(data)
{
        let matchFound = false;
        let indexFound = undefined;
        
    for (let index in AutocompleteConfiguration.REGEXP)
    {
        if (data.match(AutocompleteConfiguration.REGEXP[index]))
        {
            matchFound = true;
            indexFound = index;
            break;
        }
    }
    
    for (let index in AutocompleteConfiguration.REGEXP_EXEPTION)
    {
        if (data.match(AutocompleteConfiguration.REGEXP_EXEPTION[index]))
        {
            matchFound = false;
            indexFound = undefined;
            break;
        }
    }
    
    return {matchFound:matchFound, indexFound:indexFound};
}

function renderAutocompleteXhr(dataXhr)
{
	$.ajax({
	    url: AutocompleteConfiguration.URL.XHR,
	    type: "get",
	    data: dataXhr,
	    success: function(response) 
		{
			let status = 'SUCCESS';
			let data   = [];
			
			try 
			{
				data   = JSON.parse(response).data;
			} 
			catch (err) 
			{
				console.log('server ERROR: ', err)
			}
			
			renderAutocompleteDropdown(status, data, dataXhr);
	    },
	    error: function(xhr) 
		{
			let status = 'ERROR';
			let data   = [];

			renderAutocompleteDropdown(status, data, dataXhr);
	    }
	});
}

function renderAutocomplete(e)
{	
    let userInput = e.target.value.trim();
		
	let resultCheckByRegex = renderAutocompleteCheckByRegex(userInput);
	if(!resultCheckByRegex.matchFound)
	{																				console.log("match not found: ", resultCheckByRegex);
		return;
	}
	
	let dataXhr = AutocompleteData.dataXhr;		
	    dataXhr.userInput	= userInput;										// console.log("dataXhr: ", dataXhr);
	
        window.DomElementCache.Autocomplete.DomSpinnerJQuery.show();
    
		try
        {
            renderAutocompleteXhr(dataXhr);
        }
        catch(e)
        {
            console.log("xhr Error", e);
        }
		
	return;   
}

function renderAutocompleteDropdown(status, data, dataXhr)
{
		window.DomElementCache.Autocomplete.DomDropdownJQuery.html("");

        let delimeterNameAfter = "";
        let delimeterTypeAfter = "";
    
    for(let dataItem of data)
    {
        if (dataItem.data.house.length === 0)
        {
            delimeterNameAfter = "";
        }
        else
        {
            delimeterNameAfter = AutocompleteConfiguration.DATA.DELIMETER.STREET_NAME_AFTER;
        }
        
        if (dataItem.data.street_type.length === 0)
        {
            delimeterTypeAfter = "";
        }
        else
        {
            delimeterTypeAfter = AutocompleteConfiguration.DATA.DELIMETER.STREET_TYPE_AFTER;
        }
        
        let DomDropdownItemJQuery = $('<li></li>');
        let DomDropdownItemJQueryText = dataItem.data.street_type + delimeterTypeAfter + " " + dataItem.data.street + delimeterNameAfter + " " + dataItem.data.house;
        
            DomDropdownItemJQuery.text(DomDropdownItemJQueryText.trim())
                                 .attr('data-street-type',  dataItem.data.street_type_data)
                                 .attr('data-street',       dataItem.data.street_data)
                                 .attr('data-building',     dataItem.data.house);

        window.DomElementCache.Autocomplete.DomDropdownJQuery.append(DomDropdownItemJQuery);
    }

	if (window.DomElementCache.Autocomplete.DomDropdownJQuery.children().length === 0)
	{
		window.DomElementCache.Autocomplete.DomDropdownJQuery.html('<li>' + AutocompleteConfiguration.TEXT.dropdown.noResults + '</li>');
	}
	
	if (status === 'SUCCESS') {
	    window.DomElementCache.Autocomplete.DomDropdownJQuery.show();
	}
    
    window.DomElementCache.Autocomplete.DomSpinnerJQuery.hide();
					
	window.DomElementCache.Autocomplete.DomDropdownJQuery.find("li").each(function(index, element) {						  
	 	$(element).click(function(e) {
			AutocompleteData.streetType = $(e.target).attr('data-street-type');
			AutocompleteData.streetName = $(e.target).attr('data-street');
			AutocompleteData.building   = $(e.target).attr('data-building');
	
	    	window.DomElementCache.Autocomplete.DomInputJQuery.val($(e.target).html());								
	   	 	window.DomElementCache.Autocomplete.DomDropdownJQuery.hide();
	    	window.DomElementCache.Autocomplete.DomFormButtonSubmitJQuery.removeClass("form_1_btn_send_disabled")
																		 .removeAttr("disabled");
		});
	});
}

function renderAutocompleteStarter(e)
{			
	let timerId = setTimeout(function() {
					
		renderAutocomplete(e);
		
	}, AutocompleteConfiguration.INTERRUPT.TIMEOUT.main);
	
	for(let timerIdPrev of AutocompleteData.listTimerId)
	{
		clearTimeout(timerIdPrev);
	}
	
	AutocompleteData.listTimerId.push(timerId);
}


$(document).ready(function() {
		window.DomElementCache = {};

	function renderAutocompleteInitializer()
	{
		window.DomElementCache.Autocomplete = {};
		
        window.DomElementCache.Autocomplete.DomSpinnerJQuery  = $("#addr-spinner");
		window.DomElementCache.Autocomplete.DomInputJQuery    = $("#addr1--1");
		window.DomElementCache.Autocomplete.DomDropdownJQuery 		= $("#addr1--1-data");
		window.DomElementCache.Autocomplete.DomDropdownItemJQuery 	= $("<li><li>");
		
		window.DomElementCache.Autocomplete.DomFormJQuery     		  = $("#form--1");
		window.DomElementCache.Autocomplete.DomFormButtonSubmitJQuery = $("#form--1 .form__send");
		
		
		window.DomElementCache.Autocomplete.DomFormButtonSubmitJQuery.addClass("form_1_btn_send_disabled")
																	 .attr("disabled", "disabled");


	    $(document).click(function(e) {
	        window.DomElementCache.Autocomplete.DomDropdownJQuery.hide();
	    });
			window.DomElementCache.Autocomplete.DomDropdownJQuery.hide();
	}
		renderAutocompleteInitializer();
		
	
	window.DomElementCache.Autocomplete.DomInputJQuery.keyup(function(e) 
	{		
			let skipRender = false;
		
		for (let keyCodeSkip of AutocompleteConfiguration.INTERRUPT.KEYBOARD.SKIP_LIST)
		{
			if(e.keyCode === keyCodeSkip)
			{
				skipRender = true;
			}
		}
		
			if(skipRender)
			{
				return;
			}
                                                             
            window.DomElementCache.Autocomplete.DomFormButtonSubmitJQuery.addClass("form_1_btn_send_disabled")
                                                                         .attr("disabled", "disabled");
                                                             
			AutocompleteData.listKeyCode.push(e.keyCode);
			renderAutocompleteStarter(e);
    });
});
