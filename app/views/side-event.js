define(['app', 'lodash','moment','directives/mobi-menu',    'directives/link-list'], function(app, _,moment) {
    app.filter('fileSize', function() {
        return function(size) {
            if (size < 1024)
                return Math.ceil(size) + ' B';
            else if (size < 1048576)
                return Math.ceil((Number(size) / 1024)) + ' KB';
            else
                return Math.ceil((Number(size) / 1048576)) + ' MB';
        };
    });

    return ['mongoStorage', '$route', '$http', '$sce', '$location', '$q','authentication','$window','devRouter','$timeout', function(mongoStorage, $route, $http, $sce, $location, $q, auth,$window,devRouter,$timeout) {

        var _ctrl = this;
        var allOrgs;
        var editable=false;

        _ctrl.hasError = hasError;
        _ctrl.trustSrc = trustSrc;
        _ctrl.isEditable= isEditable;
        _ctrl.notAuth = true;
        _ctrl.goTo = goTo;
        _ctrl.tab = 'description';
        init();
        return this;


        //==============================
        //
        //==============================
        function loadOrgs() {
            return mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
                allOrgs = orgs;
            });
        }

        //==============================
        //
        //==============================
        function loadEditPermisions(doc) {
            return auth.getUser().then(
              function(u){
                  if(doc && doc.meta)
                    editable = (_.intersection(['Administrator', 'IndeAdministrator'], u.roles).length > 0 ) ||
                    (u.userID===doc.meta.createdBy && !isPastConfrence(doc.conference)) ;
                  else
                    editable =  false;

                  return editable ;
              }
            );
        }


        //==============================
        //
        //==============================
        function isPastConfrence(id) {

            var c = _.find(_ctrl.conferences,{'_id':id});
            if(!c) throw "error: conference not found";

            if(moment(c.EndDate).isAfter(new Date()))
                return false;
            else
               return true;

        }

        //==============================
        //
        //==============================
        function isEditable() {
            return editable;
        }

        //==============================
        //
        //==============================
        function loadConfrences() {

            return $http.get('/api/v2016/conferences?s={"StartDate":1}', {
                cache: true
            }).then(function(conf) {
                _ctrl.conferences = conf.data;

            }).then(function(){
              _.each(_ctrl.conferences, function(conf, key) {
                var oidArray=[];
              if(!_.isArray(conf.MajorEventIDs))conf.MajorEventIDs=[];

              _.each(conf.MajorEventIDs, function(id) {
                  oidArray.push({
                      '$oid': id
                  });
              });

              $http.get("/api/v2016/meetings", {
                  params: {
                      q: {
                          _id: {
                              $in: oidArray
                          }
                      }
                  }
              }, {
                  cache: true
              }).then(function(m) {
                  _ctrl.conferences[key].meetings = m.data;

              });
                });

            });
        }


        //==============================
        //
        //==============================
        function loadDoc() {
            var _id = $route.current.params.id;

            return mongoStorage.loadDoc('inde-side-events', _id).then(function(se) {

                return loadEditPermisions(se).then(function(){

                  if(isEditable() || se.meta.status==='published'){
                    _ctrl.notAuth=false;
                    _ctrl.doc = se;
                    _ctrl.doc.orgs = [];
                  }else if(Number(_id))
                      return loadSideEventFromRes();

                });
            }).catch(function(error){

              if(error.status===403 || (_ctrl.doc && _ctrl.doc.meta.status!=='published'))
                loadSideEventFromRes();


            });
        }

        //==============================
        //
        //==============================
        function loadSideEventFromRes(){
            var _id = $route.current.params.id;
          return $http.get("/api/v2016/reservations", {
              params: {
                  q: {
                      'sideEvent.id': Number(_id),
                      '$and':[{start:{$exists:true}},{start:{$ne:null}}]
                  }
              }
          }).then(function(se) {

              if(se.data.length){

                _ctrl.doc = se.data[0].sideEvent;
                _ctrl.doc.orgs = [];
                _ctrl.notAuth=false;
              }

              //wasPrevPub(_ctrl.doc );
          });
        }

        //==============================
        //
        //==============================
        function loadSubjects() {

            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {

            }).then(function(res) {
                if(!_ctrl.doc)_ctrl.doc={};

                _ctrl.doc.subjectObjs = [];
                _.each(_ctrl.doc.subjects, function(subj) {

                    if(_.isObject(subj))
                        _ctrl.doc.subjectObjs.push(_.find(res.data, {
                            'identifier': subj.identifier
                        }));
                    else
                      _ctrl.doc.subjectObjs.push(_.find(res.data, {
                          'identifier': subj
                      }));
                });
            }).catch(onError);
        }
        //==============================
        //
        //==============================
        function getSubjects(keys) {

            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            }).then(function(res) {
                if(!_ctrl.doc)_ctrl.doc={};

                _ctrl.doc.subjectObjs = [];
                _.each(_ctrl.doc.subjects, function(subj) {

                    _ctrl.doc.subjectObjs.push(_.find(res.data, {
                        'identifier': subj.identifier
                    }));

                });

            }).catch(onError);
        }
        //============================================================
        //
        //============================================================
        function wasPrevPub(body) {
          var wasReqOrPub = false;
          if(!body.history || body.history.length===0) return wasReqOrPub;

          body.history.forEach(function(d,index){

                if(d.meta.status==='published' )
                  wasReqOrPub = d;
          });
          return wasReqOrPub;
        }
        //==============================
        //
        //==============================
        function init() {

            $q.all([loadConfrences(), loadOrgs(),loadDoc()]).then(function() {
                loadSubjects();

                if(!_ctrl.doc) return;
                _ctrl.doc.conferenceObj = _.find(_ctrl.conferences, {
                    '_id': _ctrl.doc.conference
                });


                if (allOrgs && allOrgs.length > 0) {
                    _.each(_ctrl.doc.hostOrgs, function(org) {
                      var o =_.find(allOrgs, {
                          '_id': org
                      });
                      if(o)
                        _ctrl.doc.orgs.push(o); // findWhere
                      else
                        _ctrl.doc.orgs.push({'_id':org,acronym:'ORG WAITING FOR APPROVAL'});
                    }); // each

                }

            }).catch(onError);
        }

        //============================================================
        //
        //============================================================
        function goTo(url, code) {
            if (code)
                $location.url(url + code);
            else
                $location.url(url);
        }

        //============================================================
        //
        //============================================================
        function hasError() {
            return !!_ctrl.error;
        }
        //============================================================
        //
        //============================================================
        function trustSrc(src) {
            return $sce.trustAsResourceUrl(src);
        }



        //============================================================
        //
        //============================================================
        function onError(res) {

            _ctrl.status = "error";
            if (res.status === -1) {
                _ctrl.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                if (res.data && res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            }
            if (res.status == "notAuthorized") {
                _ctrl.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 404) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 500) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == "badSchema") {
                _ctrl.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
            } else if (res.data && res.data.Message)
                _ctrl.error = res.data.Message;
            else
                _ctrl.error = res.data;
        }




    }];


});