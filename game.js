function game() {
    var model = new Model();

    var views = {
        button: new ButtonView(),
        title: new TitleView(),
        description: new DescriptionView()
    }

    var presenter = new Presenter(model, views);

    presenter.initializeGame();
}


var Model = function(script) {
    return {
        script: script,
        state: {
            stage: 0,
            round: 0,
            scene: 0,
            lastChoice: null,
        },

        getLastChoice: function() {
            return this.state.lastChoice;
        },
        getScene: function() {
            return this.script.stages[this.state.stage].rounds[this.state.round].scenes[this.state.scene];
        },
        advanceState: function() {
            var maxStageIndex = this.script.stages.length - 1;
            var maxStageRoundIndex = this.script.stages[this.state.stage].rounds.length - 1;
            var maxRoundSceneIndex = this.script.stages[this.state.stage].rounds[this.state.round].scenes.length - 1;

            if (this.state.scene < maxRoundSceneIndex) {
                this.state.scene++;
            } else if (this.state.round < maxStageRoundIndex) {
                this.state.scene = 0;
                this.state.round++;
            } else if (this.state.stage < maxStageIndex) {
                this.state.scene = 0;
                this.state.round = 0;
                this.state.stage++;
            } else {
                console.log("Hit end of script. Game end.");
            }
        }
    }
}

var Presenter = function(model, views) {
        return {
            _model: model,
            _views: views,

            initializeGame: function() {
                this._views["button"].addButtonClickCallback(this.buttonClickListener);
            },

            updateScene: function() {
                var scene = this._model.getScene();
                this.setTitle(scene.title);
                this.setDescription(scene.description);
                this.setButtons(scene.buttons);
            },

            setTitle: function(title) {
                this._views['title'].setTitle(title);
            },

            setDescription: function(description) {
                if (description.type == "static") {
                    var newDescription = description.replace("[LAST_CHOICE]", this._model.getLastChoice());

                    this._views['description'].setDescription(newDescription);
                    return;
                }

                if (description.type = "random") {
                    var newDescription = "";

                    for (var i = 0; i < description.length; i++) {
                        var segmentIndex = Math.floor(Math.random() * description[i].length);
                        var segment = newDescription[i][segmentIndex];

                        newDescription = newDescription + " " + segment;
                    }

                    this._views['description'].setDescription(newDescription);
                    return;
                }

                throw new Error("Invalid description type " + description.type);
            },

            setButtons: function(choices) {
                if (choices.type == "static") {
                    this._views["buttons"].setButtonLabels(choices);
                    return;
                }

                if (choices.type == "random") {
                    var buttonCodes = ["A", "B", "C", "D"];
                    var selection = {};
                    var selectedIndexes = [];

                    for (i = 0; i < buttonCodes.length; i++) {
                        var index = Math.floor(Math.random() * choices.length);

                        while (index in selectedIndexes) {
                            index = Math.floor(Math.random() * choices.length);
                        }

                        selection[buttonCodes[i]] = choices[i];
                        selectedIndexes.push(index);
                    }

                    this._views["buttons"].setButtonLabels(selection);
                    return;
                }

                throw new Error("Invalid choice type " + choices.type);
            },

            buttonClickListener: function(buttonCode) {
                console.log(buttonCode);
            }
        }

        // Views: Directly update the interface.

        var TitleView = function() {
            return {
                _TITLE_ID: "text-title",

                setTitle: function(title) {
                    document.getElementById(this._TITLE_ID).innerHTML = title;
                }
            }
        }

        var DescriptionView = function() {
            return {
                _DESCRIPTION_ID: "text-description",

                setDescription: function(description) {
                    document.getElementById(this._DESCRIPTION_ID).innerHTML = description;
                }
            }
        }

        var ButtonView = function() {
            return {
                _BUTTON_A_ID: 'button-A',
                _BUTTON_B_ID: 'button-B',
                _BUTTON_C_ID: 'button-C',
                _BUTTON_D_ID: 'button-D',


                addButtonClickCallback: function(callback) {
                    this._buttonClickCallback = callback;
                    boundInterceptor = this._interceptButtonClickEvent.bind(this); // Otherwise the listeners get bound to their elements and lose context


                    document.getElementById(this._BUTTON_A_ID).addEventListener('click', boundInterceptor);
                    document.getElementById(this._BUTTON_B_ID).addEventListener('click', boundInterceptor);
                    document.getElementById(this._BUTTON_C_ID).addEventListener('click', boundInterceptor);
                    document.getElementById(this._BUTTON_D_ID).addEventListener('click', boundInterceptor);
                },

                _interceptButtonClickEvent: function(event) {
                    var buttonElementId = event.target.id;
                    var buttonCode = "";

                    if (buttonElementId === this._BUTTON_A_ID) {
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

                setButtonLabels: function(buttonLabels) {
                    document.getElementById(this._BUTTON_A_ID).innerHTML = buttonLabels.A;
                    document.getElementById(this._BUTTON_B_ID).innerHTML = buttonLabels.B;
                    document.getElementById(this._BUTTON_C_ID).innerHTML = buttonLabels.C;
                    document.getElementById(this._BUTTON_D_ID).innerHTML = buttonLabels.D;
                }
            }
        }