/**
 * Created by wangsheng on 16/6/14.
 */

function BasicLineRegularDataAnalyst(input, xAxisDataAreaLength){
    this.input = input;
    this.xAxisDataAreaLength = xAxisDataAreaLength;
}

BasicLineRegularDataAnalyst.prototype.analyze = function(){
    var maxX = null;
    var minY = null;
    var maxY = null;
    var isContinual = false;
    for(var i = 0; i < this.input.series.length; i++){
        var singleSeriesResult = this.analyzeSingleSeries(this.input.series[i][1]);

        if(maxX === null){
            maxX = singleSeriesResult.maxX;
        } else if (maxX < singleSeriesResult.maxX){
            maxX = singleSeriesResult.maxX;
        }

        if(minY === null){
            minY = singleSeriesResult.minY;
        } else if (minY > singleSeriesResult.minY){
            minY = singleSeriesResult.minY;
        }

        if(maxY === null){
            maxY = singleSeriesResult.maxY;
        } else if (maxY < singleSeriesResult.maxY){
            maxY = singleSeriesResult.maxY;
        }

        if(singleSeriesResult.isContinual){
            isContinual = true;//true if any series is continual, because all series are of same length.
        }

    }

    return  {
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        isContinual: isContinual
    };
};

BasicLineRegularDataAnalyst.prototype.analyzeSingleSeries = function(singleSeriesData){
    var minY = singleSeriesData[0];
    var maxY = singleSeriesData[0];
    var maxX = singleSeriesData.length * this.input.interval;
    var maxNodeCount = singleSeriesData.length;

    for(var i = 0; i < singleSeriesData.length; i++){
        if(singleSeriesData[i] > maxY){
            maxY = singleSeriesData[i];
        }

        if(singleSeriesData[i] < minY){
            minY = singleSeriesData[i];
        }
    }

    var isContinual = false;
    if(this.xAxisDataAreaLength / maxNodeCount < 20){
        isContinual = true;
    }

    return  {
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        isContinual: isContinual
    };
};