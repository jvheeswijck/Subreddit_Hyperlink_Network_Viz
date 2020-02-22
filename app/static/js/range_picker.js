var totalDaysShown = 12;
var monthSlider = document.getElementById('range-slider');
var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
var daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// var monthLabels = [];
// var monthYearLabels = [];
// var monthData = [];
// var lastDaysData = [];

// // Start iterator variables with today's year and month.
// var thisYear = todayYear;
// var thisMonth = todayMonthIndex;

// Iterate backwards through all the months to display setting
// the values of items on the scale
function getDate(num) {
    return new Date(Math.round(num));
}

// const start_date = new Date("1 May 2014");
// const end_date = new Date("1 May 2017");
const step_size = 24 * 60 * 60 * 1000;

var range = {
    'min': start_date.getTime(),
    'max': end_date.getTime()
}

const diffTime = Math.abs(end_date - start_date);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

noUiSlider.create(monthSlider, {
    start: [range.min + step_size, range.max - step_size],
    step: step_size,
    range: range,
    tooltips: true,
    behaviour: 'drag',
    connect: true,
    animate: true,
    animationDuration: 600,
    // pips: {
    //     mode: 'steps',
    //     density: diffDays,
    //     // Force major pips for value.
    //     filter: function () {
    //         return 1;
    //     }
    // }
});

// Remove the shortcut active class when manually setting a range.
monthSlider.noUiSlider.on('start', function () {
    $('.shortcuts li').removeClass('active');
});

monthSlider.noUiSlider.on('update', function (values, handle) {
    // var monthIndex = parseInt(values[handle]);

    // var prefixes = ['From', 'To'];

    // if (handle == 0) {
    //     var day = 1;
    // }
    // else if (handle == 1) {
    //     var day = lastDaysData[monthIndex];
    // }
    let the_date = getSliderDates()[handle]
    the_date = the_date.toDateString()
    // Set the tooltip values.
    $('.noUi-handle[data-handle="' + handle + '"]').find('.noUi-tooltip').html(`<strong>${the_date}</strong>`);

    // Update the pips values.

    // $('.noUi-pips .noUi-value').each(function () {
    //     var index = $(this).html();
    //     $(this).html(monthLabels[index]);
    // });

    // Update the input elements.
    // var minValueIndex = parseInt(values[0]);
    // var maxValueIndex = parseInt(values[1]);
    // $('input[name="month-range-min"]').val(monthData[minValueIndex]);
    // $('input[name="month-range-max"]').val(monthData[maxValueIndex]);

});

// $('.month-slider-wrapper .shortcuts li').mousedown(function () {
//     var monthPeriod = $(this).attr('data-min-range');

//     var newValues = [
//         (totalMonthsShown - monthPeriod),
//         (totalMonthsShown - 1)
//     ];

//     monthSlider.noUiSlider.set(newValues);

//     $('.shortcuts li').removeClass('active');
//     $(this).addClass('active');

// });

monthSlider.noUiSlider.on('end', function (values, handle) {
    console.log(getSliderDates())
});

function getSliderDates(){
    let [start,end] = monthSlider.noUiSlider.get();
    start = new Date(Math.round(start));
    end = new Date(Math.round(end))
    return [start, end]
}