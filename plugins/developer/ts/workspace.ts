/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var WorkspaceController = controller("WorkspaceController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["namespace"];
        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.kubernetes_Namespace;

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createWorkspaceBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        $scope.$keepPolling = () => Kubernetes.keepPollingModel;
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          $scope.item = null;
          if ($scope.id) {
            var url = UrlHelpers.join(Kubernetes.resourcesUriForKind("Projects"), $scope.id);
            log.info("Loading url: " + url);
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = enrichWorkspace(data);
                }
                $scope.model.fetched = true;
                Core.$apply($scope);
                next();
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
                next();
              });
          } else {
            $scope.model.fetched = true;
            Core.$apply($scope);
            next();

          }
        });

        $scope.fetch();
      }]);
}
