
export const monthToString = (month) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month];
}

export const getMinMaxDate = (date, uncertainty) => {
    let yearMinMax = undefined;
    let monthMinMax = undefined;
    let dayMinMax = undefined;

    if(date.year !== "X".repeat(4)) {
        yearMinMax = {
            min: parseInt(date.year) - uncertainty.year,
            max: parseInt(date.year) + uncertainty.year
        }
    }

    if(date.month !== "X".repeat(2)) {
        let min = parseInt(date.month) - uncertainty.month;
        let max = parseInt(date.month) + uncertainty.month;
        if(min < 1) {
            min = 1;
        }
        if(max > 12) {
            max = 12;
        }

        monthMinMax = {
           min, max
        }
    }
    
    if(date.day !== "X".repeat(2)) {
        let min = parseInt(date.day) - uncertainty.day;
        if(min < 1 ) {
            min = 1;
        }
        let max = parseInt(date.day) + uncertainty.day;
        if(max > 31) {
            max = 31;
        }
        dayMinMax = {
            min, max
        }
    }

    return {
        min: {
            year: yearMinMax ? yearMinMax.min : "XXXX",
            month: monthMinMax ? monthMinMax.min : "XX",
            day: dayMinMax ? dayMinMax.min : "XX"
        },
        max: {
            year: yearMinMax ? yearMinMax.max : "XXXX",
            month: monthMinMax ? monthMinMax.max : "XX",
            day: dayMinMax ? dayMinMax.max : "XX"
        }
    };
}

export const displayHistoricalDate = (date) => {
    let year = date.year;
    let month = date.month;
    let day = date.day;
    if(year === "XXXX" || year === "") {
        year = "";
    }
    if(year === "XXXX" || month === "XX" || month === "") {
        month = "";
    }else{
        month = monthToString(month - 1 % 12);
    }
    if(month === "" || day === "XX" || day === "") {
        day = "";
    }
    return `${day} ${month} ${year}`;
}