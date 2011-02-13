/********************************************************************************************************************************
/* Cv-script.dev.js - 07/02/2011 - Arnaud Lefebvre - Using JQuery																*
/* 																																*
/* This script allow you add JQuery effects on elements defining																*
/* one or more configuration. 																									*
/* These configurations have to be set with 7 elements :																		*
/* - cvTitleEltClass //Class of elements which is the title (not really used now but required)									*
/* - cvInfosEltClass //Class of elements which contains more informations														*
/* - cvMoreEltClass  //Class of elements on which a click show cvInfosEltClass													*
/* - cvLessEltClass  //Class of elements on which a click hide cvInfosEltClass													*
/* - effect			 //Effect which be apply when displaying or hidding cvInfosEltClass											*
/* - time			 //Duration in millisecond of the effect when displaying cvInfosEltClass									*
/* - hiddingTime (optionnal) //Duration in millisecond of the effect when hidding cvInfosEltClass								*
/*																																*
/********************************************************************************************************************************
/*
/* Here is an example of how to use the script :
/*
/* <html>
/* 	<head>
/* 		<script src="js/jquery.js"></script>
/*		<style>
/*			.cvInfosEltClass1 { float:right;}
/*			.cvInfosEltClass1 { float:left;}
/*		</style>
/* 	</head>
/* 	<body>
/* 		<table>
/* 			<tr>
/* 				<td><div id="cvwhat" class="cvwhat">This a very good movie.</div></td>
/* 				<td><span class="cvMoreEltClass">More infos ?</span>
/* 				<td><span class="cvLessEltClass">Less infos ?</span></td>
/*			</tr>
/* 		</table>
/*		<div class="cvInfosEltClass">
/*			This bloc contains more information
/*			about this very good movie.
/*		</div>
/*
/*		<table>
/* 			<tr>
/* 				<td><div id="cvwhat1" class="cvwhat1">This a very good movie.</div></td>
/* 				<td><span class="cvMoreEltClass1">More infos ?</span>
/* 				<td><span class="cvLessEltClass1">Less infos ?</span></td>
/*			</tr>
/* 		</table>
/*	<div class="cvInfosEltClass1">
/*		This bloc contains more information
/*		about this very good movie.
/*	</div>
/*
/*	<br />
/*	<span id="cvwhat2" class="cvwhat2">This a very good movie.</span>
/*	<span class="cvMoreEltClass2">More infos ?</span>
/*	<span class="cvLessEltClass2">Less infos ?</span>
/*	<span class="cvInfosEltClass2">
/*		This bloc contains more information
/*		about this very good movie.
/*	</span>
/*
/* 	</body>
/*	<script src="js/jquery.js"></script>
/*      <script src="js/jquery.cvscriptplugin.js"></script>
/* 	<script type="text/javascript">
/*
/* 	$("#cvwhat").hideOrShowClassPlugin({cvMoreEltClass:'.cvMoreEltClass',cvLessEltClass:'.cvLessEltClass',cvInfosEltClass:'.cvInfosEltClass'});
/* 	$("#cvwhat1").hideOrShowClassPlugin({cvMoreEltClass:'.cvMoreEltClass1',cvLessEltClass:'.cvLessEltClass1',cvInfosEltClass:'.cvInfosEltClass1'});
/* 	$("#cvwhat2").hideOrShowClassPlugin({cvMoreEltClass:'.cvMoreEltClass2',cvLessEltClass:'.cvLessEltClass2',cvInfosEltClass:'.cvInfosEltClass2'});
/*
/*      </script>
/* </html>
/****************************************************************************************************/
function Constants() {
    this.Constants = Constants.EFFECTS.none;
}

Constants.EFFECTS = {
    none : -1,
    slide : 0,
    fade: 1,
    toggle : 2,
    cvTime : "800",
    hiddingTime : "300"
}

Constants.ELEMENTS = {
    title : "title",
    more : "more",
    less : "less",
    infos : "infos",
    clmore : "clmore",
    cltitle : "cltitle",
    clless : "clless",
    clinfos : "clinfos"
}

Constants.GLOBAL = {
    nbElementsMax : 100,
    identifier : "_",
    clend : "AZBYCX",
    nbconf : 0
}

var hideOrShowClassGetConfigNumber = function(element){
    var classNames = $(element).attr("class");
    var start;
    var isfind = classNames.indexOf(Constants.ELEMENTS.clmore);
    if (isfind != -1)
        start = isfind+Constants.ELEMENTS.clmore.length;
    else{
        start = classNames.indexOf(Constants.ELEMENTS.clless)+Constants.ELEMENTS.clless.length;
    }
    var end = classNames.indexOf(Constants.GLOBAL.clend,start);
    return classNames.substring(
        start,
        end);
};

var hideOrShowClassGetElementNumber = function(element){
    var classNames = $(element).attr("class");
    var start = classNames.indexOf(Constants.GLOBAL.identifier)+Constants.GLOBAL.identifier.length;
    var end = classNames.indexOf(Constants.GLOBAL.identifier,start);
    return classNames.substring(
        start,
        end);
};
(function($) {
    $.fn.hideOrShow = function(options) {

        // définition des paramètres par défaut
        /****************************************
         *Variable par defauts :
         *cvMoreEltClass : ".cvMoreEltClass",
         *cvLessEltClass : ".cvLessEltClass",
         *cvInfosEltClass : "cvInfosEltClass",
         *effect : Constants.EFFECTS.toggle,
         *time : "-1",
         *hiddingTime : "-1"
         *****************************************/
        var defaults = {
            cvMoreEltClass : ".cvMoreEltClass",
            cvLessEltClass : ".cvLessEltClass",
            cvInfosEltClass : ".cvInfosEltClass",
            effect : Constants.EFFECTS.toggle,
            cvTime : Constants.EFFECTS.cvTime,
            hiddingTime : Constants.EFFECTS.hiddingTime,
            cvTitleEltClass : ".cvTitleEltClass"
        }
        // mélange des paramètres fournis et des paramètres par défaut
        var opts = $.extend(defaults, options);


        function HideOrShowClass() {
            this.cvMoreEltClass = "";
            this.cvLessEltClass = "";
            this.cvInfosEltClass = "";
            this.effect = Constants.EFFECTS.none;
            this.cvTime = Constants.EFFECTS.none;
            this.hiddingTime = Constants.EFFECTS.hiddingTime;
            this.isReady = false;
            this.configurations = Array();
            this.nbConfigurations = 0;

            if( typeof HideOrShowClass.initialized == "undefined" ) {
                //toString() function
                HideOrShowClass.prototype.toString = function() {
                   return "Configuration : \ncvMoreEltClass = "+this.cvMoreEltClass+",\ncvLessEltClass = "+this.cvLessEltClass+",\ncvInfosEltClass = "+this.cvInfosEltClass+",\neffect = "+this.effect+",\ncvtime = "+this.cvTime;
                };

                /** Function addConfiguration()
                 * Ajoute une configuration au moteur du script.
                 *
                 ***/
                HideOrShowClass.prototype.setUp = function() {
                    if (this.cvLessEltClass != undefined && this.cvLessEltClass != ""
                    && this.cvMoreEltClass != undefined && this.cvMoreEltClass != ""
                    && this.cvInfosEltClass != undefined && this.cvInfosEltClass != ""
                    && this.cvTime != undefined && this.cvTime != Constants.EFFECTS.none )
                    {
                        //On ajoute une class afin de différencier les élements concernés des autres appels possible du plugin.
                        $(this.cvMoreEltClass).addClass(Constants.ELEMENTS.clmore+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend);
                        $(this.cvInfosEltClass).addClass(Constants.ELEMENTS.clinfos+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend);
                        $(this.cvLessEltClass).addClass(Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend);
                        if (this.effect == Constants.EFFECTS.slide) {
                            $("."+Constants.ELEMENTS.clinfos+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).slideUp(1);
                        }
                        else if(this.effect == Constants.EFFECTS.fade) {
                            $("."+Constants.ELEMENTS.clinfos+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).fadeOut(1);
                        }
                        else if(this.effect == Constants.EFFECTS.toggle) {
                            $("."+Constants.ELEMENTS.clinfos+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).toggle(1);
                        }
                        else if (this.effect == Constants.EFFECTS.none){
                            $("."+Constants.ELEMENTS.clinfos+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).hide();
                        }
                        else
                            throw("Mauvais paramétrage de l'effet :"+this.effect);

                        $("."+Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).hide();
                        this.isReady = true;
                    }
                    else
                        throw("Une des propriétes est mal initialisée ! \n"+this.toString());
                };

                /** Function addEffects()
                 * Itere sur les configurations
                 *  Pour chaque configuration
                 *     ajoute une class aux élements cvInfosEltClass,cvLessEltClass,cvMoreEltClass,cvTitleEltClass
                 *     ajoute une fonction onclick sur les elements :
                 *          cvMoreEltClass et CvLessEltClass
                 *
                 *
                 **/
                HideOrShowClass.prototype.addEffects = function() {
                    if (this.isReady == true)
                    {
                        var currentConfig = this;
                        if (this.effect == Constants.EFFECTS.slide) {
                            //Ajout du onClick sur les élements "More"
                            $('.'+Constants.ELEMENTS.clmore+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').slideDown(currentConfig.cvTime,function() {
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                            //Ajout du onClick sur les élements "less"
                            $('.'+Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').slideUp(currentConfig.hiddingTime,function() {
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                        }
                         else if(this.effect == Constants.EFFECTS.fade) {
                             //Ajout du onClick sur les élements "More"
                            $('.'+Constants.ELEMENTS.clmore+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').fadeIn(currentConfig.cvTime,function() {
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                            //Ajout du onClick sur les élements "less"
                            $('.'+Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').fadeOut(currentConfig.hiddingTime,function() {
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                         }
                         else if(this.effect == Constants.EFFECTS.toggle) {
                              //Ajout du onClick sur les élements "More"
                            $('.'+Constants.ELEMENTS.clmore+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').toggle(currentConfig.cvTime,function() {
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                            //Ajout du onClick sur les élements "less"
                            $('.'+Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').toggle(currentConfig.hiddingTime,function() {
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                         }
                         else if(this.effect == Constants.EFFECTS.none) {
                              //Ajout du onClick sur les élements "More"
                            $('.'+Constants.ELEMENTS.clmore+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').show(currentConfig.cvTime,function() {
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                            //Ajout du onClick sur les élements "less"
                            $('.'+Constants.ELEMENTS.clless+Constants.GLOBAL.nbconf+Constants.GLOBAL.clend).each(function(index,element) {
                                $(element).addClass(Constants.GLOBAL.identifier+index+Constants.GLOBAL.identifier);
                                $(element).click(function() {
                                    var numElt = hideOrShowClassGetElementNumber(this);
                                    var numConf = hideOrShowClassGetConfigNumber(this);
                                    $('.'+Constants.ELEMENTS.clinfos+hideOrShowClassGetConfigNumber(this)+Constants.GLOBAL.clend+':eq('+numElt+')').hide(currentConfig.hiddingTime,function() {
                                             $('.'+Constants.ELEMENTS.clless+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').hide();
                                             $('.'+Constants.ELEMENTS.clmore+numConf+Constants.GLOBAL.clend+':eq('+numElt+')').show();
                                     });
                                });
                            });
                         }
                    }
                };
                HideOrShowClass.initialized = true;
            }
        }

        var hideOrShowClass = new HideOrShowClass();

        /**AJOUT D'UNE CONFIGURATION**/
        hideOrShowClass.cvMoreEltClass = opts.cvMoreEltClass;
        hideOrShowClass.cvLessEltClass = opts.cvLessEltClass;
        hideOrShowClass.cvInfosEltClass = opts.cvInfosEltClass;
        hideOrShowClass.effect = opts.effect;
        hideOrShowClass.cvTime = opts.cvTime;
        /** FIN AJOUT D'UNE CONFIGURATION **/

        hideOrShowClass.setUp();
        
        hideOrShowClass.addEffects();

        Constants.GLOBAL.nbconf++;
        return $(this);
    };
})(jQuery);

