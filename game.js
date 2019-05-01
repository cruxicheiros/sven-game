function game() {
    var view = new View();
    var model = new Model();
    var controller = new Controller(model, view);
    console.log(view._buttonElements);

    view.addButtonsEventListener(controller.buttonPress);
}

var Controller = function(model, view) {
    return {
        _view: view,
        _model: model,

        setScene: function(title, description, buttons) {
            this.setTitle(title);
            this.setDescription(description);
            this.setButtons(buttons);
        },

        setTitle: function(title) {
            this._model.title = title;
            this._view.updateTitle(title);
        },

        setDescription: function(description) {
            this._model.description = description;
            this._view.updateDescription(description);
        },

        setButtons: function(buttons) {
            this._model.buttons = buttons;
            this._view.updateButtons(buttons);
        }
    }
}

var Model = function() { //
    return {
        title: "Title",
        description: "Description",
        buttons: {
            A: "A",
            B: "B",
            C: "C",
            D: "D"
        }
    }
}

var View = function() { // Directly updates the interface
    return {
        _TITLE_ID: "text-title",
        _DESCRIPTION_ID: "text-description",

        _BUTTON_A_ID: 'button-A',
        _BUTTON_B_ID: 'button-B',
        _BUTTON_C_ID: 'button-C',
        _BUTTON_D_ID: 'button-D',

        _buttonElements = {
            A: document.getElementById(_BUTTON_A_ID),
            B: document.getElementById(_BUTTON_B_ID),
            C: document.getElementById(_BUTTON_C_ID),
            D: document.getElementById(_BUTTON_D_ID)
        },

        addButtonClickCallback: function(callback) {
            this._buttonClickCallback = callback;

            _buttonElements.A.addEventListener('click', this._interceptButtonClickEvent);
            _buttonElements.B.addEventListener('click', this._interceptButtonClickEvent);
            _buttonElements.C.addEventListener('click', this._interceptButtonClickEvent);
            _buttonElements.D.addEventListener('click', this._interceptButtonClikcEvent);
        },

        _interceptButtonClickEvent: function(event) {
            var buttonElementId = event.target.id;
            var buttonCode = "";

            if (buttonElementId === this._BUTTON_A_ID) { //TODO replace with nicer code
                buttonCode = "A";
            } else if (buttonElementId === this._BUTTON_B_ID) {
                buttonCode = "B";
            } else if (buttonElementId === this._BUTTON_C_ID) {
                buttonCode = "C";
            } else if (buttonElementId === this._BUTTON_D_ID) {
                buttonCode = "D";
            }

            this._buttonClickCallback(buttonCode);
        },

        updateTitle: function(title) {
            document.getElementById(this._TITLE_ID).innerHTML = title;
        },

        updateDescription: function(description) {
            document.getElementById(this._DESCRIPTION_ID).innerHTML = description;
        },

        updateButtons: function(buttonLabels) {
            this._buttonElements.A.innerHTML = buttonLabels.A;
            this._buttonElements.B.innerHTML = buttonLabels.B;
            this._buttonElements.C.innerHTML = buttonLabels.C;
            this._buttonElements.D.innerHTML = buttonLabels.D;
        }
    }
}