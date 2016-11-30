(function () {
    "use strict";

    angular.module("app")
    .directive("ugskDatepicker", ugskDatepicker);

    function ugskDatepicker($document, $timeout, $log) {

        var setScopeValues = function ($scope, attrs) {
            $scope.format = attrs.format || "YYYY-MM-DD";
            $scope.viewFormat = attrs.viewFormat || "Do MMMM YYYY";
            $scope.locale = attrs.locale || "en";
            //$scope.firstWeekDaySunday = $scope.$eval(attrs.firstWeekDaySunday) || false;
            $scope.placeholder = attrs.placeholder || "";

            if ($scope.model) {
                $scope.viewModel = moment($scope.model, $scope.format).format($scope.viewFormat)
            }
        };
		
		function calendar(currentValue){
			var $this = this;								
			
			$this.prevMonth = null;
			$this.nextMonth = null;
			$this.prevYear = null;
			$this.nextYear = null;			
			
			$this.init = function(date){
				$this.mainCalendarDate = moment(date).startOf('month');
				$this.prevMonth = moment($this.mainCalendarDate).add(-1, "M");
				$this.nextMonth = moment($this.mainCalendarDate).add(1, "M");
				$this.prevYear = moment($this.mainCalendarDate).add(-1, "Y");
				$this.nextYear = moment($this.mainCalendarDate).add(1, "Y");
				$this.displayDate = moment(date).format("MMMM YYYY");
				$this.days = [];
				
				var dayOfWeekFirstDayOfMonth = moment($this.mainCalendarDate).startOf('month').isoWeekday();
				var dayOfWeekLastDayOfMonth = moment($this.mainCalendarDate).endOf('month').isoWeekday();
				var firstDate = moment($this.mainCalendarDate).add((1-dayOfWeekFirstDayOfMonth), "d");
				var lastDate = moment($this.mainCalendarDate).endOf('month').add(7-dayOfWeekLastDayOfMonth, "d");
				var period = parseInt(lastDate.diff(firstDate, "days"));
				
				for (var i = 0; i <= period; i++) {                        
					var item = {
						name: firstDate.date(),
						value: moment(firstDate),
						enabled: true,
						selected: moment(firstDate).isSame(moment(currentValue).startOf('day')),
						current: moment(firstDate).isSame(moment().startOf('day')),
						anothe: !moment(firstDate).isSame(moment($this.mainCalendarDate).startOf('day'), "month")
					};					

					$this.days.push(item);
					firstDate.add(1, "d");
				}
			}
			
			$this.selectPrevMonth = function(){
				$this.init($this.prevMonth);
			}
			
			$this.selectNextMonth = function(){
				$this.init($this.nextMonth);
			}
			
			$this.selectPrevYear = function(){
				$this.init($this.prevYear);
			}
			
			$this.selectNextYear = function(){
				$this.init($this.nextYear);
			}
			$this.init(currentValue);
		}
		
        return {
            restrict: "E",
            require: "ngModel",
            scope: {
                model: "=ngModel"
            },
            link: function ($scope, $element, attrs, $ctrl) {                
                $scope.calendarOpened = false;
                $scope.days = [];
                $scope.dayNames = [];
                $scope.dateValue = null;
                $scope.mouseOnCalendar = false;

                $scope.changeViewModel = changeViewModel;
                $scope.showCalendar = showCalendar;
                $scope.closeCalendar = closeCalendar;
                $scope.elementBlur = elementBlur;
                $scope.setValue = setValue;

                setScopeValues($scope, attrs);
                moment.locale($scope.locale);
                               
                var generateDayNames = function () {
                    var date = $scope.firstWeekDaySunday === true ? moment("2015-06-07") : moment("2015-06-01");
                    for (var i = 0; i < 7; i += 1) {
                        $scope.dayNames.push(date.format("ddd"));
                        date.add("1", "d");
                    }
                };

                generateDayNames();

                $scope.keypressed = function (ev) {
                    if (ev.keyCode == 13) {
                        var d = moment($scope.viewModel, $scope.viewFormat)
                        $scope.viewModel = d.format($scope.viewFormat);
                        $scope.closeCalendar();
                    }
                    else if (ev.keyCode == 27) { //ESC
                        var d = moment($scope.viewModel, $scope.viewFormat)
                        $scope.viewModel = d.format($scope.viewFormat);
                        $scope.closeCalendar();
                    }
                }

                function showCalendar() {                    
					$scope.calendar = new calendar($scope.viewModel ?
                                            moment($scope.viewModel, $scope.viewFormat) :
                                            moment());
					$scope.calendarOpened = true;

					var i = 5;
                };

                function elementBlur() {
                    if (!$scope.calendarOpened || $scope.mouseOnCalendar) return;
                    $scope.calendarOpened = false;
                }

                function closeCalendar() {

                    $scope.calendarOpened = false;
                };

                function changeViewModel() {
                    if ($scope.viewModel.length === $scope.viewFormat.length) {
                        if (moment($scope.viewModel, $scope.viewFormat).isValid()) {
                            $scope.setValue(moment($scope.viewModel, $scope.viewFormat));                            
                        }
                    }
                }

                function setValue(date) {
                    $scope.viewModel = date.format($scope.viewFormat);
                    $scope.model = date.format($scope.format);
                }

                $scope.prevYear = function () {
					if($scope.viewModel){
						generateCalendar(moment($scope.viewModel, $scope.viewFormat).add(-1, "Y"));
					}
					else{
						generateCalendar(moment());
					}
                };

				$scope.nextYear = function () {
                    if($scope.viewModel){
						generateCalendar(moment($scope.viewModel, $scope.viewFormat).add(1, "Y"));
					}
					else{
						generateCalendar(moment());
					}
                };
				
                $scope.prevMonth = function () {
                    if($scope.viewModel){
						generateCalendar(moment($scope.viewModel, $scope.viewFormat).add(-1, "M"));
					}
					else{
						generateCalendar(moment());
					}
                };

                $scope.nextMonth = function () {
                    if($scope.viewModel){
						generateCalendar(moment($scope.viewModel, $scope.viewFormat).add(1, "M"));
					}
					else{
						generateCalendar(moment());
					}
                };                

                $scope.selectDate = function (date) {
                    $scope.setValue(moment(date, $scope.viewFormat));
                    $scope.closeCalendar();
                };

                //$ctrl.$parsers.push(function (data) {
                //    //convert data from view format to model format
                //    $log.debug("$parsers: " + data);
                //    if (!data)
                //        return null;

                //    return moment($ctrl.$viewModel, $scope.viewFormat).format($scope.format);
                //});

                //$ctrl.$formatters.push(function (data) {
                //    //convert data from model format to view format
                //    $log.debug("$formatters: " + data);
                //    if (!data)
                //        return null;

                //    return moment($ctrl.$modelValue, $scope.format).format($scope.viewFormat); //converted
                //});

            },
            templateUrl: "src/js/ugskDatepickerTemplate.html"
        };

    }
})();
