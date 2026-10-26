$(function() {
    // Update slider displays
    function updateSliderDisplay(id) {
        const value = $(`#${id}`).val();
        const display = $(`#${id}_display`);
        
        if (id === 'AVG_TIME_PER_VISIT') {
            display.text(parseFloat(value).toFixed(1));
        } else if (id === 'AVG_VISITS_PER_DAY' || id === 'LOST_ACCOUNTS_PER_MONTH' || id === 'NON_PRODUCTIVE_HRS_PER_DAY') {
            display.text(parseFloat(value).toFixed(1));
        } else {
            display.text(parseFloat(value).toFixed(1) + '%');
        }
    }

    // Attach event listeners to all sliders and inputs
    $('input[type="range"]').on('input', function() {
        updateSliderDisplay($(this).attr('id'));
    });

    $('input[type="number"]').on('input', function() {
        const id = $(this).attr('id');
        if ($(`#${id}_display`).length) {
            updateSliderDisplay(id);
        }
    });

    function validateScreen1() {
        let isValid = true;
        let errorMessage = '';

        // Remove previous error styling
        $('#screen1 .form-control').removeClass('is-invalid');

        // Get values
        const MR = $('#MR').val();
        const GM = $('#GM').val();
        const REPS = $('#REPS').val();
        const AOV = $('#AOV').val();
        const WRK_DAYS = $('#WRK_DAYS').val();

        // Check if fields are empty
        if (!MR || MR <= 0) {
            $('#MR').addClass('is-invalid');
            isValid = false;
            errorMessage += '• Monthly Revenue/Sales must be greater than 0\n';
        }

        if (!GM || GM < 0 || GM > 100) {
            $('#GM').addClass('is-invalid');
            isValid = false;
            errorMessage += '• Gross Margin must be between 0 and 100\n';
        }

        if (!REPS || REPS < 1) {
            $('#REPS').addClass('is-invalid');
            isValid = false;
            errorMessage += '• Number of Sales Reps must be at least 1\n';
        }

        if (!AOV || AOV <= 0) {
            $('#AOV').addClass('is-invalid');
            isValid = false;
            errorMessage += '• Average Order Value must be greater than 0\n';
        }

        if (!WRK_DAYS || WRK_DAYS < 1) {
            $('#WRK_DAYS').addClass('is-invalid');
            isValid = false;
            errorMessage += '• Working Days must be at least 1\n';
        }

        return isValid;
    }

    // Navigation
    $('#nextBtn').on('click',function() {
        if (validateScreen1()) {
            $('#screen1').removeClass('active');
            $('#screen2').addClass('active');
            $('#dot1').removeClass('active');
            $('#dot2').addClass('active');
        }
    });

    $('#backBtn').on('click',function() {
        $('#screen2').removeClass('active');
        $('#screen1').addClass('active');
        $('#dot2').removeClass('active');
        $('#dot1').addClass('active');
    });

    $('#recalculateBtn').on('click',function() {
        $('#dashboard').hide();
        $('#screen2').addClass('active');
        $('#dot2').addClass('active');
    });

    // Calculate function
    $('#calculateBtn').on('click',function() {
        // Get base inputs
        const MR = parseFloat($('#MR').val());
        const GM = parseFloat($('#GM').val()) / 100;
        const REPS = parseFloat($('#REPS').val());
        const WRK_DAYS = parseFloat($('#WRK_DAYS').val());
        const AOV = parseFloat($('#AOV').val());

        // Get leakage inputs (as decimals)
        const AVG_VISITS_PER_DAY = parseFloat($('#AVG_VISITS_PER_DAY').val());
        const MISSED_VISIT = parseFloat($('#MISSED_VISIT').val()) / 100;
        const MISSED_FOLLOWUP = parseFloat($('#MISSED_FOLLOWUP').val()) / 100;
        const DELAYED_ORDER = parseFloat($('#DELAYED_ORDER').val()) / 100;
        const LOST_ACCOUNTS_PER_MONTH = parseFloat($('#LOST_ACCOUNTS_PER_MONTH').val());
        const ORDER_ERROR = parseFloat($('#ORDER_ERROR').val()) / 100;
        const RETURN = parseFloat($('#RETURN').val()) / 100;
        const STOCKOUT = parseFloat($('#STOCKOUT').val()) / 100;
        const NON_PRODUCTIVE_HRS_PER_DAY = parseFloat($('#NON_PRODUCTIVE_HRS_PER_DAY').val());

        // Get assumptions
        const AVG_TIME_PER_VISIT = parseFloat($('#AVG_TIME_PER_VISIT').val());
        const ORDER_CONVERSION = parseFloat($('#ORDER_CONVERSION').val()) / 100;
        const STOCKOUT_LOSS_FACTOR = parseFloat($('#STOCKOUT_LOSS_FACTOR').val()) / 100;

        // Base calculations
        const MONTHLY_ORDERS = MR / AOV;

        // A. Visit & beat discipline loss
        const TOTAL_VISITS = REPS * AVG_VISITS_PER_DAY * WRK_DAYS;
        const MISSED_VISITS = TOTAL_VISITS * MISSED_VISIT;
        const LOST_VISIT_ORDERS = MISSED_VISITS * ORDER_CONVERSION;
        const LOST_VISIT_REV = LOST_VISIT_ORDERS * AOV;

        // B. Follow-up failure loss
        const FOLLOWUP_LOST_ORDERS = MONTHLY_ORDERS * MISSED_FOLLOWUP;
        const FOLLOWUP_LOST_REV = FOLLOWUP_LOST_ORDERS * AOV;

        // C. Delayed order loss
        const DELAYED_ORDERS = MONTHLY_ORDERS * DELAYED_ORDER;
        const DELAYED_REV = DELAYED_ORDERS * AOV * 0.4;

        // D. Account churn loss
        const CHURN_REV_LOSS = LOST_ACCOUNTS_PER_MONTH * AOV * 4;

        // E. Wrong order & return leakage
        const ERROR_LOSS = MONTHLY_ORDERS * ORDER_ERROR * AOV;
        const RETURN_LOSS = MONTHLY_ORDERS * RETURN * AOV * 0.5;
        const ERROR_RETURN_TOTAL = ERROR_LOSS + RETURN_LOSS;

        // F. Time wastage loss
        const LOST_HOURS = REPS * NON_PRODUCTIVE_HRS_PER_DAY * WRK_DAYS;
        const LOST_VISITS_TIME = LOST_HOURS / AVG_TIME_PER_VISIT;
        const TIME_LOST_ORDERS = LOST_VISITS_TIME * ORDER_CONVERSION;
        const TIME_LOST_REV = TIME_LOST_ORDERS * AOV;

        // G. Stock-out loss
        const STOCKOUT_LOSS = MONTHLY_ORDERS * STOCKOUT * AOV * STOCKOUT_LOSS_FACTOR;

        // Total calculations
        const TOTAL_MONTHLY_LEAKAGE = LOST_VISIT_REV + FOLLOWUP_LOST_REV + 
            DELAYED_REV + CHURN_REV_LOSS + ERROR_RETURN_TOTAL + TIME_LOST_REV + STOCKOUT_LOSS;
        
        const TOTAL_PROFIT_LEAKAGE = TOTAL_MONTHLY_LEAKAGE * GM;
        const YEARLY_LEAKAGE = TOTAL_MONTHLY_LEAKAGE * 12;

        // Format currency
        function formatCurrency(value) {
            return '₹' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        // Update dashboard
        $('#dash_monthly_revenue').text(formatCurrency(TOTAL_MONTHLY_LEAKAGE));
        $('#dash_monthly_profit').text(formatCurrency(TOTAL_PROFIT_LEAKAGE));
        $('#dash_hours_wasted').text(LOST_HOURS.toFixed(2) + ' hrs');
        $('#dash_yearly').text(formatCurrency(YEARLY_LEAKAGE));

        // Update breakdown
        $('#break_visit').text(formatCurrency(LOST_VISIT_REV));
        $('#break_followup').text(formatCurrency(FOLLOWUP_LOST_REV));
        $('#break_delayed').text(formatCurrency(DELAYED_REV));
        $('#break_churn').text(formatCurrency(CHURN_REV_LOSS));
        $('#break_error').text(formatCurrency(ERROR_RETURN_TOTAL));
        $('#break_time').text(formatCurrency(TIME_LOST_REV));
        $('#break_stockout').text(formatCurrency(STOCKOUT_LOSS));

        // Show dashboard
        $('#screen2').removeClass('active');
        $('#dashboard').fadeIn();
    });

    // Initialize displays
    $('input[type="range"]').each(function() {
        updateSliderDisplay($(this).attr('id'));
    });
});