var Model = function(view) {
    return {
        _view: view,

        _title: "Title",
        _description: "Description",
        _buttons: [
            "Zero",
            "One",
            "Two",
            "Three"
        ],

        setTitle: function (title) {
            this._title = title;
            this._view.updateTitle(title);
        },

        setDescription: function (description) {
            this._description = description;
            this._view.updateDescription(description);
        },

        setButtons: function (buttonLabels) {
            if (buttonLabels.length != 4) {
                throw new Error("The number of buttons needs to be 4. " + buttonLabels.toString() + " contains " + buttonLabels.length + ".");
            }

            this._buttons = buttonLabels;
            this._view.updateButtons(buttonLabels)
        }
    }
}

var View = function() {
    return {
        _TITLE_ID: "text-title",
        _DESCRIPTION_ID: "text-description",
        _BUTTON_0_ID: 'button-0',
        _BUTTON_1_ID: 'button-1',
        _BUTTON_2_ID: 'button-2',
        _BUTTON_3_ID: 'button-3',        

        updateTitle: function(title) {
            document.getElementById(this._TITLE_ID).innerHTML = title;
        },

        updateDescription: function(description) {
            document.getElementById(this._DESCRIPTION_ID).innerHTML = description;
        },

        updateButtons: function(buttonLabels) {
            document.getElementById(this._BUTTON_0_ID).innerHTML = buttonLabels[0];
            document.getElementById(this._BUTTON_1_ID).innerHTML = buttonLabels[1];
            document.getElementById(this._BUTTON_2_ID).innerHTML = buttonLabels[2];
            document.getElementById(this._BUTTON_0_ID).innerHTML = buttonLabels[3];
        }
    }
}