define(['app', 'lodash',

  'text!./edit-side-event.html',
    'css!./edit-side-event',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  'scbd-branding/side-menu/scbd-menu-service',
  'scbd-angularjs-controls/km-inputtext-ml',
  'scbd-angularjs-controls/km-control-group',
  'scbd-angularjs-controls/km-date',
  'scbd-angularjs-controls/km-rich-textbox',

      'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    'scbd-angularjs-controls/km-select',
    // 'scbd-angularjs-controls/km-form-languages',
    'scbd-angularjs-controls/km-inputtext-list',
'../controls/scbd-select-list',
    '../../../services/mongo-storage',
    '../controls/scbd-file-upload',
    './edit-organization',
  'scbd-branding/scbd-media'

], function(app, _,template) { //'scbd-services/utilities',


  app.directive("editSideEvent", ['scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$window', //"$http", "$filter", "Thesaurus",
      function(scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,auth,$window) {
      return {
        restrict   : 'E',
        template   : template,
        replace    : true,
        transclude : false,
        scope      : {},
        link : function($scope) {//, $http, $filter, Thesaurus

              $scope._id = $route.current.params.id;
              $scope.loading=false;
              $scope.schema="inde-side-events";
              $scope.showOrgForm = 0;

              $scope.toggle = scbdMenuService.toggle;
              $scope.dashboard = scbdMenuService.dashboard;
              $scope.doc={};
              $scope.doc.hostOrgs=[];
              $scope.updateProfile=1;

              $scope.$watch('doc.confrence',function(){
                if($scope.doc.confrence){
                  generateEventId($scope.doc.confrence);
                }
              });


            return $http.get("https://api.cbd.int/api/v2015/countries", {
                cache: true
            }).then(function(o) {

                $scope.countries =  $filter("orderBy")(o.data, "name");
            });


              init();

              //============================================================
              //
              //============================================================
              function init() {

                if($scope._id!=='0' ){
                    if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
                      $location.url('/404');
                    else
                      mongoStorage.loadDoc($scope.schema,$scope._id).then(function(document){

                            $scope.loading=true;
                            $scope._id=document[0];
                            $scope.doc=document[1];
                            initProfile();
                      });
                  }
                else{
                    mongoStorage.createDoc($scope.schema).then(
                            function(document){
                              $scope.loading=true;
                              $scope._id=document[0];
                              $scope.doc=document[1];
                              $scope.doc.logo=randomPic();
                              initProfile();
                            }
                    );
                }

              }// init
              //============================================================
              //
              //============================================================
              function saveProfile() {
                  var data;
                  data.Email = $scope.doc.contact.email;
                  data.Address = $scope.doc.contact.address;
                  data.City = $scope.doc.contact.city;
                  data.Country = $scope.doc.contact.country;
                  data.personalTitle = $scope.doc.contact.personalTitle;
                  data.State = $scope.doc.contact.state;
                  data.Zip =  $scope.doc.contact.zip;
                  data.Phone = $scope.doc.contact.phone;
                  data.FirstName = $scope.doc.contact.firstName;
                  data.LastName = $scope.doc.contact.lastName;
                  data.Designation = $scope.doc.contact.jobTitle;
console.log(data);return;
                authHttp.put('/api/v2013/users/' + $scope.user.userID, angular.toJson(data)).success(function () {

                    //$location.path('/profile/done');

                }).error(function (data) {
                    $scope.waiting = false;
                    $scope.error = data;
                });

              }// initProfile()

              //============================================================
              //
              //============================================================
              function initProfile() {
                  auth.getUser().then(function(user){
                    $scope.user=user;
                    return $http.get('https://api.cbd.int/api/v2013/users/' + $scope.user.userID).then(function onsuccess (response) {
                        console.log('response.data',response.data);
                        if(!$scope.doc)$scope.doc={};
                        if(!$scope.doc.contact)$scope.doc.contact={};


                         $scope.doc.contact.email = _.clone(response.data.Email);
                         $scope.doc.contact.address= _.clone(response.data.Address);
                         $scope.doc.contact.city= _.clone(response.data.City);
                         $scope.doc.contact.country= _.clone(response.data.Country);
                         $scope.doc.contact.personalTitle= _.clone(response.data.Title);
                         $scope.doc.contact.state= _.clone(response.data.State);
                         $scope.doc.contact.zip= _.clone(response.data.Zip);
                         $scope.doc.contact.phone= _.clone(response.data.Phone);
                         $scope.doc.contact.firstName= _.clone(response.data.FirstName);
                         $scope.doc.contact.lastName= _.clone(response.data.LastName);
                         $scope.doc.contact.jobTitle= _.clone(response.data.Designation);

                    }).catch(function onerror (response) {
                        $scope.error = response.data;
                    });
                  });
              }// initProfile()

              //============================================================
              ///app/images/ic_event_black_48px.svg
              //============================================================
              function randomPic() {
                    var num = Math.floor((Math.random() * 12) + 1);
                    return 'https://s3.amazonaws.com/mongo.document.attachments/inde-config/56c4863bc0e5501192caa152/Avatar'+num+'.svg';

              }// initProfile()

              $scope.randomPic = function (){
                $scope.doc.logo=randomPic();
              }

              //============================================================
              //
              //============================================================
              $scope.toggleIcon= function() {
                  if($scope.doc.logo==='/app/images/ic_event_black_48px.svg')
                      $scope.doc.logo=randomPic();
                  else
                      $scope.doc.logo='/app/images/ic_event_black_48px.svg';
              }// initProfile()

              //============================================================
              //
              //============================================================
              function generateEventId(confId) {

                return mongoStorage.generateEventId(confId).then(function(res){

                    console.log(res);
                      return res;
                });
              }// generateEventId



              //============================================================
              //
              //============================================================
              $scope.options = {
                  hostOrgs: function() {
                      return mongoStorage.loadDocs('inde-orgs')
                      .then(function(o) {
                            _.each(o.data,function(docObj,key){
                                  if(docObj.document && docObj.document.title && docObj.document.title.en)
                                  docObj.title=docObj.document.title;
                                  else {
                                    delete o.data[key];
                                  }
                            })
                          return $filter("orderBy")(o.data, "title");
                      });
                  },

              };

              //=======================================================================
              //
              //=======================================================================
              $scope.orgCallback= function(newOrgId){
                    $scope.showOrgForm=0;

              };

              //=======================================================================
              //
              //=======================================================================
              $scope.toggleOrg= function(event){
                    $scope.showOrgForm=!$scope.showOrgForm;
                    event.stopPropagation();
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.saveDoc = function(){

                //delete($scope.doc.meta);
                  console.log('saving',$scope.doc);
                  if($scope.doc.prefDate)
                    _.each($scope.doc.prefDate,function(pref,key){
                        if(pref)
                          $scope.doc.prefDate[key] = Number(toTimestamp(pref));
                  });

                  if(!$scope.doc.confrence) throw "Error no confrence selected";
                  generateEventId($scope.doc.confrence).then(
                    function(res){
                      $scope.doc.id=Number(res.data.count)+1;
                      saveProfile();
                      mongoStorage.save($scope.schema,$scope.doc,$scope._id);
                  });
              };
              //=======================================================================
              //
              //=======================================================================
             function toTimestamp(dateString){
                var newDate = dateString.split("-");
                return new Date(newDate[0],newDate[1],newDate[2]).getTime();
              }

              //=======================================================================
              //
              //=======================================================================
              $scope.goTo = function(url){

                  $location.url(url);
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.close = function(){

                  $window.history.back();
              };
        }//link
      };//return
  }]);
});