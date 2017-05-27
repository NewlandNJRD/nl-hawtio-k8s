/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var JenkinsJobController = controller("JenkinsJobController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.jobId = $routeParams["job"];
        $scope.schema = KubernetesSchema;
        $scope.entityChangedCache = {};

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.tableConfig = {
          data: 'job.builds',
          showSelectionCheckbox: true,
          enableRowClickSelection: false,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: '$sortOrder',
              displayName: 'Name',
              cellTemplate: $templateCache.get("jenkinsBuildIdTemplate.html")
            },
            {
              field: '$buildLink',
              displayName: 'Views',
              cellTemplate: $templateCache.get("jenkinsBuildButtonsTemplate.html")
            },
            {
              field: '$duration',
              displayName: 'Duration',
              cellTemplate: $templateCache.get("jenkinsBuildDurationTemplate.html")
            },
            {
              field: '$timestamp',
              displayName: 'Time Started',
              cellTemplate: $templateCache.get("jenkinsBuildTimestampTemplate.html")
            }
          ]
        };
        updateData();


        function updateData() {
          if ($scope.jobId) {
            var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, "api/json?depth=1"));
            if (url && (!$scope.job || Kubernetes.keepPollingModel)) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    enrichJenkinsJob(data, $scope.id, $scope.jobId);
                    if (hasObjectChanged(data, $scope.entityChangedCache)) {
                      log.info("entity has changed!");
                      $scope.job = data;
                    }
                  }
                  $scope.model.fetched = true;
                  Core.$apply($scope);
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          } else {
            $scope.model.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
