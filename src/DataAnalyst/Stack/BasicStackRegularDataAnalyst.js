/**
 * this class analyze the input data of a basic stack chart
 * @param input                 the input data of a basic stack chart
 * @param xAxisDataAreaLength   the display area length of the data. this is used to determine if the space is enough for drawing
 *                              a node for each single data point.
 * @constructor
 */
import {dataAnalystCommons} from "../DataAnalystCommons";
import {util} from "../../Util/Util";

export function BasicStackRegularDataAnalyst(input, xAxisDataAreaLength){
    this.input = input;
    this.xAxisDataAreaLength = xAxisDataAreaLength;
}

/**
 * finds the min max value, and if the space is big enough for drawing a node for every single data point.
 * @returns the result of the analysis.
 */
BasicStackRegularDataAnalyst.prototype.analyze = function(){
    //initialize the minY and maxY to be 0, so that if all other values are positive, the minY is set to be 0 no matter
    //what the smallest value is. If all other values are negative, the maxY is set to be 0 no matter what the biggest value
    //is
    let minY = 0;
    let maxY = 0;

    let singleSeriesLength = this.input.series[0][1].length;


    for(let s = 0; s < singleSeriesLength; s++){
        let stackedData = 0;
        for(let i = 0; i < this.input.series.length; i++){
            stackedData = stackedData +  this.input.series[i][1][s];

            //compare the minY and maxY with data ever stacked (does not need to be final stacked value)/
            if(stackedData < minY){
                minY = stackedData;
            }

            if(stackedData > maxY){
                maxY = stackedData
            }
        }
    }

    let isContinual = dataAnalystCommons.isContinual(this.xAxisDataAreaLength, singleSeriesLength);

    let maxX = util.chooseBetween(this.input.start === undefined, 0, this.input.start) + (singleSeriesLength - 1) * this.input.interval;

    return  {
        minX: this.input.start,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        isContinual: isContinual
    };
};