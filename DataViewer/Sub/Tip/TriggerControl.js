/**
 * Created by wangsheng on 27/6/14.
 */


function TriggerControl(tipControl, seriesName, mcColor){
    this.tipControl = tipControl;
    this.seriesName = seriesName;
    this.mcColor = mcColor;
    this.sharedSeriesInfo = this.tipControl.sharedSeriesInfo;
}

/**
 *
 * @param columnTrigger
 * @param htmlContainer
 * @param seriesName
 * @param mcColor
 * @param nodes
 */
TriggerControl.prototype.enableColumnTrigger = function(columnTrigger, htmlContainer, seriesName, mcColor, nodes){
    var _this = this;
    //register this thing first.
    var sharedSeriesInfo = this.sharedSeriesInfo;
    var sharedSeriesInfoRegisterIdx = sharedSeriesInfo.registerSingleSeries(seriesName, mcColor, null, nodes);

    columnTrigger.addEventListener("mouseover", function(event){
        var pixelX = _this.sharedSeriesInfo.getPixelX(sharedSeriesInfoRegisterIdx, 0);
        var pixelY = event.clientY - htmlContainer.getBoundingClientRect().top;
        _this.tipControl.showTip(pixelX, pixelY, sharedSeriesInfoRegisterIdx, 0);
        event.stopPropagation();
    });

    columnTrigger.addEventListener("mouseout", function(event){
        _this.tipControl.hideTip();
        event.stopPropagation();
    });
};

/**
 * This method requires the target has the following property:
 * 1. ws_nodesStrideIdx
 * @param nodeMouseOverSectionGroup     but really it can be of any shape, a column, a node
 * @param seriesName
 * @param mcColor
 * @param highlightedNode               this method activates(translates it into proper position and show it) this 'highlightedNode'.
 * @param nodes
 */
TriggerControl.prototype.enableNodeTrigger = function(nodeMouseOverSectionGroup, seriesName, mcColor, highlightedNode, nodes){
    //register this thing first.
    var sharedSeriesInfo = this.sharedSeriesInfo;
    var sharedSeriesInfoRegisterIdx = sharedSeriesInfo.registerSingleSeries(seriesName, mcColor, highlightedNode, nodes);
    var _this = this;

    var isShown = false; //set the flag yeah.
    function highlightNode(pixelX, pixelY) {
        if (!isShown) {
            draw.setVisibility(highlightedNode, true);
            isShown = true;
        }
        draw.translate(highlightedNode, pixelX, pixelY);
    }

    function deHighlightNode() {
       if (isShown) {
           draw.setVisibility(highlightedNode, false);
           isShown = false;
       }
    }
    nodeMouseOverSectionGroup.addEventListener("mouseover", function (event) {
        var pixelX = sharedSeriesInfo.getPixelX(sharedSeriesInfoRegisterIdx, event.target.ws_nodesStrideIdx);
        var pixelY = sharedSeriesInfo.getPixelY(sharedSeriesInfoRegisterIdx, event.target.ws_nodesStrideIdx);
        highlightNode(pixelX, pixelY);
        _this.tipControl.showTip(pixelX, pixelY, sharedSeriesInfoRegisterIdx, event.target.ws_nodesStrideIdx);
        event.stopPropagation();
    });

    nodeMouseOverSectionGroup.addEventListener("mouseout", function (event) {
        deHighlightNode();
        _this.tipControl.hideTip();
        event.stopPropagation();
    });

};

TriggerControl.prototype.enableRoutineTrace = function(htmlContainer, seriesName, mcColor, nodes, routineGroup, constantInterval, xDrawInfo){
    //register this thing first.
    var sharedSeriesInfo = this.sharedSeriesInfo;
    var sharedSeriesInfoRegisterIdx = sharedSeriesInfo.registerSingleSeries(seriesName, mcColor, null, nodes);

    var _this = this;
    var previousIdx = -1; //this idex is the stride idx. and stride idx happens to be the same of dataXarray idx.
    var mouseX = 0;
    var traceIntervalId = 0;

    //this handler has different definitions based on whether the data has constant data interval or irregular data interval
    var findAndHighLight;

    if(constantInterval !== false){
        findAndHighLight = function(){
            var mouseXinSVGcoordinates = mouseX - htmlContainer.getBoundingClientRect().left;
            var estimatedDataX = (mouseXinSVGcoordinates - xDrawInfo.startPoint)/xDrawInfo.pixelPerData + xDrawInfo.min;
            var strideIdx = Math.round((estimatedDataX - xDrawInfo.min)/constantInterval);
            if(strideIdx!==previousIdx){
                previousIdx = strideIdx;
                var pixelX = _this.sharedSeriesInfo.getPixelX(sharedSeriesInfoRegisterIdx, strideIdx);
                var pixelY = _this.sharedSeriesInfo.getPixelY(sharedSeriesInfoRegisterIdx, strideIdx);
//                highlightNode(pixelX, pixelY);
                _this.tipControl.showTip(pixelX, pixelY, sharedSeriesInfoRegisterIdx, strideIdx);
            }
        };
    } else {
        //extract the dataX and make it a standalone array where stride is 1 and offset is 0.
        var dataXarray = [];
        for(var i = 0; i < nodes.length; i = i + 4){
            dataXarray.push(nodes[i + 2]); //offset is 2.
        }

        findAndHighLight = function(){
            var mouseXinSVGcoordinates = mouseX - htmlContainer.getBoundingClientRect().left;
            var estimatedDataX = (mouseXinSVGcoordinates - xDrawInfo.startPoint)/xDrawInfo.pixelPerData + xDrawInfo.min;

            //binary search, find the nearest node.
            var strideIdx = util.findElementIdxUsingBinarySearch(dataXarray, estimatedDataX); //the returned strideIdx is of dataXarray
            if(strideIdx !== previousIdx) {
                previousIdx = strideIdx;
                var pixelX = _this.sharedSeriesInfo.getPixelX(sharedSeriesInfoRegisterIdx, strideIdx);
                var pixelY = _this.sharedSeriesInfo.getPixelY(sharedSeriesInfoRegisterIdx, strideIdx);
//                highlightedNode(pixelX, pixelY);
                _this.tipControl.showTip(pixelX, pixelY, sharedSeriesInfoRegisterIdx, strideIdx);
            }
        };
    }

    //the mouse move event might be trigger like 280+ times per second.
    routineGroup.addEventListener("mousemove",  function(event){
        mouseX = event.clientX;
    });

    //but we will only do checking 5 times per second since finding the right element is computational stressful.
    routineGroup.addEventListener("mouseover",  function(event){
        //reset the previousIdx. I need to do this because if the found idx is the same as the previous idx the tip won't show up.
        previousIdx = -1;
        //update the mouse position and show the tip anyway.
        mouseX = event.clientX;
        findAndHighLight();

        //now set an interval and constantly check if the mouse move to another node.
        traceIntervalId = window.setInterval(findAndHighLight, 200);
    });

    routineGroup.addEventListener("mouseout",  function(){
        window.clearInterval(traceIntervalId);
//        deHighlightNode();
        _this.tipControl.hideTip();
    });
};