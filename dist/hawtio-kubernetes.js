/// <reference path="../libs/hawtio-forms/defs.d.ts"/>
/// <reference path="../libs/hawtio-kubernetes-api/defs.d.ts"/>
/// <reference path="../libs/hawtio-oauth/defs.d.ts"/>
/// <reference path="../libs/hawtio-ui/defs.d.ts"/>
/// <reference path="../libs/hawtio-utilities/defs.d.ts"/>

/// <reference path="../../includes.ts"/>
var Developer;
(function (Developer) {
    function enrichWorkspaces(projects) {
        angular.forEach(projects, function (project) {
            enrichWorkspace(project);
        });
        return projects;
    }
    Developer.enrichWorkspaces = enrichWorkspaces;
    function enrichWorkspace(build) {
        if (build) {
            var name = Kubernetes.getName(build);
            build.$name = name;
            build.$sortOrder = 0 - build.number;
            var nameArray = name.split("-");
            var nameArrayLength = nameArray.length;
            build.$shortName = (nameArrayLength > 4) ? nameArray.slice(0, nameArrayLength - 4).join("-") : name.substring(0, 30);
            var labels = Kubernetes.getLabels(build);
            build.$creationDate = asDate(Kubernetes.getCreationTimestamp(build));
            build.$labelsText = Kubernetes.labelsToString(labels);
            if (name) {
                build.$projectsLink = UrlHelpers.join("workspaces", name);
                build.$runtimeLink = UrlHelpers.join("kubernetes/namespace/", name, "/apps");
                build.$viewLink = build.$projectsLink;
            }
        }
        return build;
    }
    Developer.enrichWorkspace = enrichWorkspace;
    function asDate(value) {
        return value ? new Date(value) : null;
    }
    Developer.asDate = asDate;
    function enrichJenkinsJobs(jobsData, projectId, jobName) {
        if (jobsData) {
            angular.forEach(jobsData.jobs, function (job) {
                enrichJenkinsJob(job, projectId, jobName);
            });
        }
        return jobsData;
    }
    Developer.enrichJenkinsJobs = enrichJenkinsJobs;
    function enrichJenkinsJob(job, projectId, jobName) {
        if (job) {
            jobName = jobName || job.name || projectId;
            job.$jobId = jobName;
            job.$project = projectId || jobName;
            var lastBuild = job.lastBuild;
            var lastBuildResult = lastBuild ? lastBuild.result : "NOT_STARTED";
            var $iconClass = createBuildStatusIconClass(lastBuildResult);
            job.$lastBuildNumber = enrichJenkinsBuild(job, lastBuild);
            job.$lastSuccessfulBuildNumber = enrichJenkinsBuild(job, job.lastSuccessfulBuild);
            job.$lastFailedlBuildNumber = enrichJenkinsBuild(job, job.lastFailedlBuild);
            if (lastBuild) {
                job.$duration = lastBuild.duration;
                job.$timestamp = asDate(lastBuild.timestamp);
            }
            var jobUrl = (job || {}).url;
            if (!jobUrl || !jobUrl.startsWith("http")) {
                var jenkinsUrl = jenkinsLink();
                if (jenkinsUrl) {
                    jobUrl = UrlHelpers.join(jenkinsUrl, "job", jobName);
                }
            }
            if (jobUrl) {
                job.$jobLink = jobUrl;
                var workspaceName = Kubernetes.currentKubernetesNamespace();
                job.$pipelinesLink = UrlHelpers.join("/workspaces", workspaceName, "projects", job.$project, "jenkinsJob", jobName, "pipelines");
                job.$buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", job.$project, "jenkinsJob", jobName);
            }
            job.$iconClass = $iconClass;
            angular.forEach(job.builds, function (build) {
                enrichJenkinsBuild(job, build);
            });
        }
        return job;
    }
    Developer.enrichJenkinsJob = enrichJenkinsJob;
    function createBuildStatusIconClass(result) {
        var $iconClass = "fa fa-spinner fa-spin";
        if (result) {
            if (result === "FAILURE" || result === "FAILED") {
                // TODO not available yet
                $iconClass = "fa fa-exclamation-circle red";
            }
            else if (result === "ABORTED" || result === "INTERUPTED") {
                $iconClass = "fa fa-circle grey";
            }
            else if (result === "SUCCESS") {
                $iconClass = "fa fa-check-circle green";
            }
            else if (result === "NOT_STARTED") {
                $iconClass = "fa fa-circle-thin grey";
            }
        }
        return $iconClass;
    }
    Developer.createBuildStatusIconClass = createBuildStatusIconClass;
    function createBuildStatusBackgroundClass(result) {
        var $iconClass = "build-pending";
        if (result) {
            if (result === "FAILURE" || result === "FAILED") {
                $iconClass = "build-fail";
            }
            else if (result === "ABORTED" || result === "INTERUPTED") {
                $iconClass = "build-aborted";
            }
            else if (result === "SUCCESS") {
                $iconClass = "build-success";
            }
            else if (result === "NOT_STARTED") {
                $iconClass = "build-not-started";
            }
        }
        return $iconClass;
    }
    Developer.createBuildStatusBackgroundClass = createBuildStatusBackgroundClass;
    function enrichJenkinsBuild(job, build) {
        var number = null;
        if (build) {
            build.$duration = build.duration;
            build.$timestamp = asDate(build.timestamp);
            var projectId = job.$project;
            var jobName = job.$jobId || projectId;
            var buildId = build.id;
            number = build.number;
            var workspaceName = Kubernetes.currentKubernetesNamespace();
            var $iconClass = createBuildStatusIconClass(build.result);
            var jobUrl = (job || {}).url;
            if (!jobUrl || !jobUrl.startsWith("http")) {
                var jenkinsUrl = jenkinsLink();
                if (jenkinsUrl) {
                    jobUrl = UrlHelpers.join(jenkinsUrl, "job", jobName);
                }
            }
            if (jobUrl) {
                build.$jobLink = jobUrl;
                if (buildId) {
                    //build.$logsLink = UrlHelpers.join(build.$buildLink, "console");
                    build.$logsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", buildId);
                    build.$pipelineLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "pipeline", buildId);
                    build.$buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName);
                    //build.$buildLink = UrlHelpers.join(jobUrl, build.id);
                    build.$buildLink = build.$logsLink;
                }
            }
            build.$iconClass = $iconClass;
        }
        return number;
    }
    Developer.enrichJenkinsBuild = enrichJenkinsBuild;
    function jenkinsLink() {
        var ServiceRegistry = Kubernetes.inject("ServiceRegistry");
        if (ServiceRegistry) {
            return ServiceRegistry.serviceLink(Developer.jenkinsServiceName);
        }
        return null;
    }
    Developer.jenkinsLink = jenkinsLink;
    function forgeReadyLink() {
        var ServiceRegistry = Kubernetes.inject("ServiceRegistry");
        if (ServiceRegistry) {
            return ServiceRegistry.serviceReadyLink(Kubernetes.fabric8ForgeServiceName);
        }
        return null;
    }
    Developer.forgeReadyLink = forgeReadyLink;
    function enrichJenkinsPipelineJob(job, projectId, jobId) {
        if (job) {
            job.$project = projectId;
            job.$jobId = jobId;
            angular.forEach(job.builds, function (build) {
                enrichJenkinsStages(build, projectId, jobId);
            });
        }
    }
    Developer.enrichJenkinsPipelineJob = enrichJenkinsPipelineJob;
    function enrichJenkinsStages(build, projectId, jobName) {
        if (build) {
            build.$project = projectId;
            build.$jobId = jobName;
            build.$timestamp = asDate(build.timeInMillis);
            build.$iconClass = createBuildStatusIconClass(build.result || "NOT_STARTED");
            var workspaceName = Kubernetes.currentKubernetesNamespace();
            var parameters = build.parameters;
            var $parameterCount = 0;
            var $parameterText = "No parameters";
            if (parameters) {
                $parameterCount = _.keys(parameters).length || 0;
                $parameterText = Kubernetes.labelsToString(parameters, " ");
            }
            build.$parameterCount = $parameterCount;
            build.$parameterText = $parameterText;
            var jenkinsUrl = jenkinsLink();
            if (jenkinsUrl) {
                var url = build.url;
                if (url) {
                }
            }
            build.$logLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", build.id);
            build.$viewLink = build.$logLink;
            angular.forEach(build.stages, function (stage) {
                enrichJenkinsStage(stage, build);
            });
        }
        return build;
    }
    Developer.enrichJenkinsStages = enrichJenkinsStages;
    function enrichJenkinsStage(stage, build) {
        if (build === void 0) { build = null; }
        if (stage) {
            if (build) {
                stage.$buildId = build.id;
                stage.$project = build.$project;
            }
            var projectId = build.$project;
            var jobName = build.$jobId || projectId;
            var buildId = build.id;
            var workspaceName = Kubernetes.currentKubernetesNamespace();
            stage.$backgroundClass = createBuildStatusBackgroundClass(stage.status);
            stage.$iconClass = createBuildStatusIconClass(stage.status);
            stage.$startTime = asDate(stage.startTime);
            if (!stage.duration) {
                stage.duration = 0;
            }
            var jenkinsUrl = jenkinsLink();
            if (jenkinsUrl) {
                var url = stage.url;
                if (url) {
                    stage.$viewLink = UrlHelpers.join(jenkinsUrl, url);
                    stage.$logLink = UrlHelpers.join(stage.$viewLink, "log");
                    if (projectId && buildId) {
                        stage.$logLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", buildId);
                    }
                }
            }
        }
    }
    Developer.enrichJenkinsStage = enrichJenkinsStage;
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
var Developer;
(function (Developer) {
    Developer.context = '/workspaces';
    Developer.hash = '#' + Developer.context;
    Developer.pluginName = 'Developer';
    Developer.pluginPath = 'plugins/developer/';
    Developer.templatePath = Developer.pluginPath + 'html/';
    Developer.log = Logger.get(Developer.pluginName);
    Developer.jenkinsServiceName = "jenkins";
    Developer.jenkinsServiceNameAndPort = Developer.jenkinsServiceName + ":http";
    Developer.jenkinsHttpConfig = {
        headers: {
            Accept: "application/json, text/x-json, text/plain"
        }
    };
    /**
     * Returns true if the value hasn't changed from the last cached JSON version of this object
     */
    function hasObjectChanged(value, state) {
        var json = angular.toJson(value || "");
        var oldJson = state.json;
        state.json = json;
        return !oldJson || json !== oldJson;
    }
    Developer.hasObjectChanged = hasObjectChanged;
    function projectForScope($scope) {
        if ($scope) {
            return $scope.buildConfig || $scope.entity || ($scope.model || {}).project;
        }
        return null;
    }
    Developer.projectForScope = projectForScope;
    /**
     * Lets load the project versions for the given namespace
     */
    function loadProjectVersions($scope, $element, project, env, ns, answer, caches) {
        var projectAnnotation = "project";
        var versionAnnotation = "version";
        var projectNamespace = project.$namespace;
        var projectName = project.$name;
        var cache = caches[ns];
        if (!cache) {
            cache = {};
            caches[ns] = cache;
        }
        var status = {
            rcs: [],
            pods: []
        };
        function updateModel() {
            var projectInfos = {};
            angular.forEach(status.rcs, function (item) {
                var metadata = item.metadata || {};
                var name = metadata.name;
                var labels = metadata.labels || {};
                var annotations = metadata.annotations || {};
                var spec = item.spec || {};
                var selector = spec.selector;
                var project = labels[projectAnnotation];
                var version = labels[versionAnnotation];
                if (project && version) {
                    var projects = projectInfos[project];
                    if (!projects) {
                        projects = {
                            project: project,
                            versions: {}
                        };
                        projectInfos[project] = projects;
                    }
                    var versionInfo = projects.versions[version];
                    if (!versionInfo) {
                        versionInfo = {
                            replicationControllers: {}
                        };
                        projects.versions[version] = versionInfo;
                    }
                    if (name) {
                        versionInfo.replicationControllers[name] = item;
                        item.$name = name;
                        if (projectNamespace && projectName) {
                            item.$viewLink = UrlHelpers.join("/workspaces/", projectNamespace, "projects", projectName, "namespace", ns, "replicationControllers", name);
                        }
                        else {
                            Developer.log.warn("Missing project data! " + projectNamespace + " name " + projectName);
                        }
                    }
                    item.$buildId = annotations["fabric8.io/build-id"];
                    item.$buildUrl = annotations["fabric8.io/build-url"];
                    item.$gitCommit = annotations["fabric8.io/git-commit"];
                    item.$gitUrl = annotations["fabric8.io/git-url"];
                    item.$gitBranch = annotations["fabric8.io/git-branch"];
                    if (selector) {
                        var selectorText = Kubernetes.labelsToString(selector, ",");
                        var podLinkUrl = UrlHelpers.join(Developer.projectLink(projectName), "namespace", ns, "pods");
                        item.pods = [];
                        item.$podCounters = Kubernetes.createPodCounters(selector, status.pods, item.pods, selectorText, podLinkUrl);
                    }
                }
                else {
                    Developer.log.warn("Missing project version metadata for RC " + ns + " / " + name + " project: " + project + " version: " + version);
                }
            });
            if (hasObjectChanged(projectInfos, cache)) {
                Developer.log.info("project versions has changed!");
                answer[ns] = projectInfos;
            }
        }
        Kubernetes.watch($scope, $element, "replicationcontrollers", ns, function (data) {
            if (data) {
                status.rcs = data;
                updateModel();
            }
        });
        Kubernetes.watch($scope, $element, "pods", ns, function (data) {
            if (data) {
                status.pods = data;
                updateModel();
            }
        });
    }
    Developer.loadProjectVersions = loadProjectVersions;
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
var Developer;
(function (Developer) {
    /*
      function homeBreadcrumb() {
        return {
          href: "/home",
          label: "Home",
          title: "Go to the home page"
        }
      }
    */
    function developBreadcrumb() {
        return {
            href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces"),
            label: "Develop",
            title: "View all the developer workspaces"
        };
    }
    function operateBreadcrumb() {
        return {
            href: UrlHelpers.join(HawtioCore.documentBase(), "/namespaces"),
            label: "Manage",
            title: "Manage the namespaces and resources inside them"
        };
    }
    function workspaceLink() {
        return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", Kubernetes.currentKubernetesNamespace());
    }
    Developer.workspaceLink = workspaceLink;
    function projectLink(projectId) {
        var link = workspaceLink();
        if (projectId) {
            return UrlHelpers.join(link, "/projects", projectId);
        }
        else {
            return link;
        }
    }
    Developer.projectLink = projectLink;
    function createWorkspacesBreadcrumbs(developPerspective) {
        /*
            if (developPerspective) {
              return [
                //homeBreadcrumb(),
                developBreadcrumb()
              ];
            } else {
              return [
                //homeBreadcrumb(),
                operateBreadcrumb()
              ];
            }
        */
        return [];
    }
    Developer.createWorkspacesBreadcrumbs = createWorkspacesBreadcrumbs;
    function createWorkspacesSubNavBars(developPerspective) {
        return activateCurrent([
            developBreadcrumb(),
            operateBreadcrumb()
        ]);
    }
    Developer.createWorkspacesSubNavBars = createWorkspacesSubNavBars;
    function createWorkspaceBreadcrumbs(children, workspaceName) {
        if (children === void 0) { children = null; }
        if (workspaceName === void 0) { workspaceName = null; }
        var answer = [
            //homeBreadcrumb(),
            developBreadcrumb()
        ];
        if (!workspaceName) {
            workspaceName = Kubernetes.currentKubernetesNamespace();
        }
        if (workspaceName) {
            answer.push({
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces/", workspaceName),
                label: workspaceName,
                title: "View the workspace: " + workspaceName
            });
            return processChildren(answer, children);
        }
        return answer;
    }
    Developer.createWorkspaceBreadcrumbs = createWorkspaceBreadcrumbs;
    function createEnvironmentBreadcrumbs($scope, $location, $routeParams) {
        var ns = Kubernetes.currentKubernetesNamespace();
        var namespacesLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace");
        var workspaceName = $routeParams.workspace;
        var project = $routeParams.project;
        if (workspaceName && project) {
            var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
            $scope.$projectLink = projectLink;
            $scope.$projectNamespaceLink = UrlHelpers.join(projectLink, "namespace", ns);
            namespacesLink = UrlHelpers.join(projectLink, "namespace");
            // TODO use the logical name?
            var envName = ns;
            var buildConfig = null;
            if ($scope.model) {
                buildConfig = $scope.model.getProject(project, workspaceName);
                if (buildConfig) {
                    // lets find the label for the namespace
                    var env = _.find(buildConfig.environments, { namespace: ns });
                    if (env) {
                        envName = env['label'] || envName;
                    }
                    Developer.log.info("env found: " + env + " for nameppace " + ns + " on buildConfig: " + buildConfig);
                }
            }
            var children = [
                {
                    href: UrlHelpers.join(projectLink, "environments"),
                    label: "Environments",
                    title: "View the environments for this project"
                },
                {
                    href: UrlHelpers.join(namespacesLink, ns, "apps"),
                    label: envName,
                    title: "View the runtime of the workspace: " + ns
                }
            ];
            return createProjectBreadcrumbs(project, children, workspaceName);
        }
        else {
            if (!workspaceName) {
                workspaceName = Kubernetes.currentKubernetesNamespace();
            }
            return activateCurrent([
                //homeBreadcrumb(),
                operateBreadcrumb(),
                {
                    href: UrlHelpers.join(namespacesLink, ns, "apps"),
                    label: workspaceName,
                    title: "View the runtime of the workspace: " + ns
                }
            ]);
        }
    }
    Developer.createEnvironmentBreadcrumbs = createEnvironmentBreadcrumbs;
    function createProjectBreadcrumbs(projectName, children, workspaceName) {
        if (projectName === void 0) { projectName = null; }
        if (children === void 0) { children = null; }
        if (workspaceName === void 0) { workspaceName = null; }
        if (!workspaceName) {
            workspaceName = Kubernetes.currentKubernetesNamespace();
        }
        var answer = createWorkspaceBreadcrumbs(null, workspaceName);
        if (workspaceName) {
            if (projectName) {
                answer.push({
                    href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects"),
                    label: "Projects",
                    title: "View all the projects"
                });
                answer.push({
                    href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName),
                    label: projectName,
                    title: "View the project: " + projectName
                });
            }
            return processChildren(answer, children);
        }
        return answer;
    }
    Developer.createProjectBreadcrumbs = createProjectBreadcrumbs;
    function createProjectSettingsBreadcrumbs(projectName, workspaceName) {
        if (workspaceName === void 0) { workspaceName = null; }
        var children = [{
                label: "Settings",
                title: "View the settings of this project"
            }];
        if (!projectName) {
            var children = [{
                    label: "New Project",
                    title: "Lets make a new project"
                }];
        }
        return createProjectBreadcrumbs(projectName, children, workspaceName);
    }
    Developer.createProjectSettingsBreadcrumbs = createProjectSettingsBreadcrumbs;
    function createWorkspaceSubNavBars() {
        var workspaceName = Kubernetes.currentKubernetesNamespace();
        return activateCurrent([
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName),
                label: "Projects",
                title: "View the projects for this workspace"
            },
            {
                isValid: function () { return Developer.jenkinsLink(); },
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "jenkinsJob"),
                label: "Builds",
                title: "View the projects for this workspace"
            },
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace", workspaceName, "apps"),
                label: "Runtime",
                title: "View the runtime environment for this workspace"
            },
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "detail"),
                label: "Detail",
                title: "View the workspace detail"
            }
        ]);
    }
    Developer.createWorkspaceSubNavBars = createWorkspaceSubNavBars;
    function createBuildsLink(workspaceName, projectName, jenkinsJobId) {
        workspaceName = workspaceName || Kubernetes.currentKubernetesNamespace();
        return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId);
    }
    function createProjectSubNavBars(projectName, jenkinsJobId, $scope) {
        if (jenkinsJobId === void 0) { jenkinsJobId = null; }
        if ($scope === void 0) { $scope = null; }
        var workspaceName = Kubernetes.currentKubernetesNamespace();
        var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName);
        var buildsLink = UrlHelpers.join(projectLink, "builds");
        if (!jenkinsJobId) {
            jenkinsJobId = projectName;
        }
        var jenkinsBuildLink = null;
        var pipelinesLink = null;
        if (projectName && jenkinsJobId) {
            jenkinsBuildLink = createBuildsLink(workspaceName, projectName, jenkinsJobId);
            pipelinesLink = UrlHelpers.join(jenkinsBuildLink, "pipelines");
        }
        function isJenkinsBuild() {
            var answer = Developer.jenkinsLink() && jenkinsBuildLink;
            if (answer && $scope) {
                var entity = Developer.projectForScope($scope);
                if (entity) {
                    return answer && entity.$jenkinsJob;
                }
            }
            return answer;
        }
        var answer = [
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "environments"),
                //href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName),
                label: "Overview",
                title: "View the overview of this project, its actiity, environments and pipelines"
            },
            {
                isValid: function () { return isJenkinsBuild() && pipelinesLink; },
                id: "pipelines",
                href: pipelinesLink,
                label: "Pipelines",
                title: "View the pipeline builds for this project"
            },
            {
                isValid: function () { return !isJenkinsBuild(); },
                href: buildsLink,
                label: "Builds",
                title: "View the builds for this project"
            },
            {
                isValid: function () { return isJenkinsBuild(); },
                id: "builds",
                href: jenkinsBuildLink,
                label: "Builds",
                title: "View the Jenkins builds for this project"
            },
            {
                isValid: function () { return isJenkinsBuild(); },
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId, "metrics"),
                label: "Metrics",
                title: "View the metrics for this project"
            },
            /*
                  {
                    href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "tools"),
                    label: "Tools",
                    title: "View the tools for this project"
                  },
            */
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "buildConfigEdit"),
                label: "Settings",
                title: "View the project configuration"
            }
        ];
        var context = {
            workspaceName: workspaceName,
            projectName: projectName,
            projectLink: projectLink,
            jenkinsJobId: jenkinsJobId,
            $scope: $scope
        };
        angular.forEach(Developer.customProjectSubTabFactories, function (fn) {
            if (angular.isFunction(fn)) {
                var subtab = fn(context);
                if (subtab) {
                    answer.push(subtab);
                }
            }
        });
        return activateCurrent(answer);
    }
    Developer.createProjectSubNavBars = createProjectSubNavBars;
    function createProjectSettingsSubNavBars(projectName, jenkinsJobId) {
        if (jenkinsJobId === void 0) { jenkinsJobId = null; }
        if (!projectName) {
            return [];
        }
        var workspaceName = Kubernetes.currentKubernetesNamespace();
        var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName);
        if (!jenkinsJobId) {
            jenkinsJobId = projectName;
        }
        var answer = [
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "buildConfigEdit"),
                label: "Core",
                title: "View the core project configuration"
            },
            {
                href: projectWorkspaceLink(workspaceName, projectName, "forge/secrets"),
                label: "Secrets",
                title: "View or change the secrets used to edit project source code in the source control system"
            },
            {
                href: editPipelineLink(workspaceName, projectName),
                label: "Pipeline",
                title: "View the DevOps and pipeline configuration"
            }
        ];
        return activateCurrent(answer);
    }
    Developer.createProjectSettingsSubNavBars = createProjectSettingsSubNavBars;
    function editPipelineLinkScope($scope) {
        return editPipelineLink($scope.namespace, $scope.projectId || $scope.projectName || $scope.project);
    }
    Developer.editPipelineLinkScope = editPipelineLinkScope;
    function editPipelineLink(workspaceName, projectName) {
        return projectWorkspaceLink(workspaceName, projectName, "forge/command/devops-edit");
    }
    Developer.editPipelineLink = editPipelineLink;
    function projectWorkspaceLink(workspaceName, projectName, path) {
        if (!projectName) {
            return "";
        }
        if (!workspaceName) {
            workspaceName = Kubernetes.currentKubernetesNamespace();
        }
        return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, path);
    }
    Developer.projectWorkspaceLink = projectWorkspaceLink;
    Developer.customProjectSubTabFactories = [];
    function createJenkinsBreadcrumbs(projectName, jobId, buildId) {
        var workspaceName = Kubernetes.currentKubernetesNamespace();
        var children = [
            {
                id: "builds",
                href: createBuildsLink(workspaceName, projectName, jobId),
                label: "Builds",
                title: "View the builds for this project"
            }
        ];
        if (buildId) {
            children.push({
                id: "",
                href: "",
                label: "#" + buildId,
                title: "Build #" + buildId
            });
        }
        return createProjectBreadcrumbs(projectName, children);
    }
    Developer.createJenkinsBreadcrumbs = createJenkinsBreadcrumbs;
    function createJenkinsSubNavBars(projectName, jenkinsJobId, buildId, extraOption) {
        if (extraOption === void 0) { extraOption = null; }
        var answer = createProjectSubNavBars(projectName, jenkinsJobId);
        if (extraOption) {
            extraOption.active = true;
            answer.push(extraOption);
        }
        return answer;
    }
    Developer.createJenkinsSubNavBars = createJenkinsSubNavBars;
    function createEnvironmentSubNavBars($scope, $location, $routeParams) {
        var ns = Kubernetes.currentKubernetesNamespace();
        var workspaceName = $routeParams.workspace;
        var project = $routeParams.project;
        var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes");
        if (workspaceName && project) {
            projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
        }
        var namespacesLink = UrlHelpers.join(projectLink, "namespace");
        return activateCurrent([
            {
                href: UrlHelpers.join(namespacesLink, ns, "apps"),
                label: "Apps",
                title: "View the apps for this workspace"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "services"),
                label: "Services",
                title: "View the apps for this workspace"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "replicationControllers"),
                label: "Controllers",
                title: "View the Replication Controllers for this workspace"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "pods"),
                label: "Pods",
                title: "View the pods for this workspace"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "secrets"),
                label: "Secrets",
                title: "View the secrets for this workspace"
            },
            {
                href: UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/hosts"),
                label: "Nodes",
                title: "View the nodes for this workspace"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "overview"),
                label: "Overview",
                title: "View all the objects in this workspace and their relationship"
            },
            {
                href: UrlHelpers.join(namespacesLink, ns, "angryPods"),
                label: "Angry Pods",
                title: "Try the Angry Pods game!"
            },
        ]);
    }
    Developer.createEnvironmentSubNavBars = createEnvironmentSubNavBars;
    function namespaceLink($scope, $routeParams, path) {
        if (path === void 0) { path = null; }
        var ns = Kubernetes.currentKubernetesNamespace();
        var workspaceName = $routeParams.workspace;
        var project = $routeParams.project;
        var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes");
        if (workspaceName && project) {
            projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
        }
        return UrlHelpers.join(projectLink, "namespace", ns, path);
    }
    Developer.namespaceLink = namespaceLink;
    /**
     * Removes the URL query string if its inside the given text
     */
    function trimQuery(text) {
        if (text) {
            var idx = text.indexOf("?");
            if (idx >= 0) {
                return text.substring(0, idx);
            }
        }
        return text;
    }
    function activateCurrent(navBarItems) {
        navBarItems = _.compact(navBarItems);
        var injector = HawtioCore.injector;
        var $location = injector ? injector.get("$location") : null;
        if ($location) {
            var path = trimQuery($location.path());
            var found = false;
            angular.forEach(navBarItems, function (item) {
                if (item) {
                    var href = item.href;
                    var trimHref = trimQuery(href);
                    if (!found && trimHref && trimHref === path) {
                        item.active = true;
                        found = true;
                    }
                }
            });
        }
        return navBarItems;
    }
    function processChildren(answer, children) {
        if (children) {
            if (angular.isArray(children)) {
                answer = answer.concat(children);
            }
            else {
                answer.push(children);
            }
        }
        activateCurrent(answer);
        return answer;
    }
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="developerHelpers.ts"/>
var Developer;
(function (Developer) {
    Developer._module = angular.module(Developer.pluginName, ['hawtio-core', 'hawtio-ui', 'ui.codemirror', 'nvd3']);
    Developer.controller = PluginHelpers.createControllerFunction(Developer._module, Developer.pluginName);
    Developer.route = PluginHelpers.createRoutingFunction(Developer.templatePath);
    Developer._module.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when(Developer.context, Developer.route('workspaces.html', false))
                .when("/namespaces", Developer.route('workspaces.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace'), Developer.route('projects.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/detail'), Developer.route('workspace.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/jenkinsJob'), Developer.route('jenkinsJobs.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects'), Developer.route('projects.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id'), Developer.route('environments.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/detail'), Kubernetes.route('buildConfig.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/builds'), Kubernetes.route('builds.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/environments'), Developer.route('environments.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsJob/:job'), Developer.route('jenkinsJob.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsJob/:job/log/:build'), Developer.route('jenkinsLog.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsJob/:job/pipelines'), Developer.route('pipelines.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsJob/:job/pipeline/:build'), Developer.route('pipeline.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsJob/:job/metrics'), Developer.route('jenkinsMetrics.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/jenkinsMetrics'), Developer.route('jenkinsMetrics.html', false))
                .when(UrlHelpers.join(Developer.context, '/:namespace/projects/:id/tools'), Developer.route('tools.html', false))
                .when(UrlHelpers.join(Developer.context, '/:workspace/projects/:project/environments/:namespace'), Developer.route('environment.html', false))
                .when(UrlHelpers.join(Developer.context, '/:workspace/projects/:project/environments/:namespace'), Developer.route('environment.html', false))
                .otherwise("/workspaces");
        }]);
    Developer._module.run(['viewRegistry', 'ServiceRegistry', 'HawtioNav', 'KubernetesModel', '$templateCache', function (viewRegistry, ServiceRegistry, HawtioNav, KubernetesModel, $templateCache) {
            Developer.log.debug("Running");
            viewRegistry['workspaces'] = Kubernetes.templatePath + 'layoutKubernetes.html';
            viewRegistry['namespaces'] = Kubernetes.templatePath + 'layoutKubernetes.html';
            var builder = HawtioNav.builder();
            var workspaces = builder.id('workspaces')
                .href(function () { return Developer.context; })
                .title(function () { return 'All'; })
                .build();
            var workspaceOverview = builder.id('workspaces')
                .href(function () { return UrlHelpers.join(Developer.context, 'overview'); })
                .title(function () { return 'Workspace'; })
                .build();
            var workspacesTab = builder.id('workspaces')
                .rank(100)
                .href(function () { return Developer.context; })
                .title(function () { return 'Workspaces'; })
                .tabs(workspaces)
                .build();
            HawtioNav.add(workspacesTab);
        }]);
    Developer._module.filter('asTrustedHtml', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }]);
    hawtioPluginLoader.addModule(Developer.pluginName);
    // for scroll-glue directive
    hawtioPluginLoader.addModule('luegg.directives');
})(Developer || (Developer = {}));

var Kubernetes;
(function (Kubernetes) {
    var consts = (function () {
        function consts() {
        }
        Object.defineProperty(consts.prototype, "NAMESPACE_STORAGE_KEY", {
            get: function () { return "k8sSelectedNamespace"; },
            enumerable: true,
            configurable: true
        });
        return consts;
    }());
    Kubernetes.consts = consts;
    Kubernetes.Constants = new consts();
    var WatchTypes = (function () {
        function WatchTypes() {
        }
        Object.defineProperty(WatchTypes, "ENDPOINTS", {
            get: function () { return "endpoints"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "EVENTS", {
            get: function () { return "events"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "NAMESPACES", {
            get: function () { return "namespaces"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "NODES", {
            get: function () { return "nodes"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "PERSISTENT_VOLUMES", {
            get: function () { return "persistentvolumes"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "PERSISTENT_VOLUME_CLAIMS", {
            get: function () { return "persistentvolumeclaims"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "PODS", {
            get: function () { return "pods"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "REPLICATION_CONTROLLERS", {
            get: function () { return "replicationcontrollers"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "RESOURCE_QUOTAS", {
            get: function () { return "resourcequotas"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "OAUTH_CLIENTS", {
            get: function () { return "oauthclients"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "SECRETS", {
            get: function () { return "secrets"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "SERVICES", {
            get: function () { return "services"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "SERVICE_ACCOUNTS", {
            get: function () { return "serviceaccounts"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "TEMPLATES", {
            get: function () { return "templates"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "ROUTES", {
            get: function () { return "routes"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "BUILD_CONFIGS", {
            get: function () { return "buildconfigs"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "BUILDS", {
            get: function () { return "builds"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "DEPLOYMENT_CONFIGS", {
            get: function () { return "deploymentconfigs"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "IMAGE_STREAMS", {
            get: function () { return "imagestreams"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "POLICIES", {
            get: function () { return "policies"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "POLICY_BINDINGS", {
            get: function () { return "policybindings"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "PROJECTS", {
            get: function () { return "projects"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "ROLE_BINDINGS", {
            get: function () { return "rolebindings"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchTypes, "ROLES", {
            get: function () { return "roles"; },
            enumerable: true,
            configurable: true
        });
        return WatchTypes;
    }());
    Kubernetes.WatchTypes = WatchTypes;
    var NamespacedTypes = (function () {
        function NamespacedTypes() {
        }
        Object.defineProperty(NamespacedTypes, "k8sTypes", {
            get: function () {
                return [
                    WatchTypes.ENDPOINTS,
                    WatchTypes.EVENTS,
                    WatchTypes.NODES,
                    WatchTypes.PERSISTENT_VOLUMES,
                    WatchTypes.PERSISTENT_VOLUME_CLAIMS,
                    WatchTypes.PODS,
                    WatchTypes.REPLICATION_CONTROLLERS,
                    WatchTypes.RESOURCE_QUOTAS,
                    WatchTypes.PERSISTENT_VOLUMES,
                    WatchTypes.SECRETS,
                    WatchTypes.SERVICES,
                    WatchTypes.SERVICE_ACCOUNTS
                ];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NamespacedTypes, "osTypes", {
            get: function () {
                return [
                    WatchTypes.TEMPLATES,
                    WatchTypes.BUILD_CONFIGS,
                    WatchTypes.ROUTES,
                    WatchTypes.BUILDS,
                    WatchTypes.BUILD_CONFIGS,
                    WatchTypes.DEPLOYMENT_CONFIGS,
                    WatchTypes.IMAGE_STREAMS,
                    WatchTypes.OAUTH_CLIENTS,
                    WatchTypes.POLICIES,
                    WatchTypes.POLICY_BINDINGS,
                    WatchTypes.PROJECTS,
                ];
            },
            enumerable: true,
            configurable: true
        });
        return NamespacedTypes;
    }());
    Kubernetes.NamespacedTypes = NamespacedTypes;
    var WatchActions = (function () {
        function WatchActions() {
        }
        Object.defineProperty(WatchActions, "ANY", {
            get: function () { return "*"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchActions, "ADDED", {
            get: function () { return "ADDED"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchActions, "MODIFIED", {
            get: function () { return "MODIFIED"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WatchActions, "DELETED", {
            get: function () { return "DELETED"; },
            enumerable: true,
            configurable: true
        });
        return WatchActions;
    }());
    Kubernetes.WatchActions = WatchActions;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesInterfaces.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.context = '/kubernetes';
    Kubernetes.hash = '#' + Kubernetes.context;
    Kubernetes.defaultRoute = Kubernetes.hash + '/apps';
    Kubernetes.pluginName = 'Kubernetes';
    Kubernetes.pluginPath = 'plugins/kubernetes/';
    Kubernetes.templatePath = Kubernetes.pluginPath + 'html/';
    Kubernetes.log = Logger.get(Kubernetes.pluginName);
    Kubernetes.keepPollingModel = true;
    Kubernetes.defaultIconUrl = Core.url("/img/kubernetes.svg");
    Kubernetes.hostIconUrl = Core.url("/img/host.svg");
    // this gets set as a pre-bootstrap task
    Kubernetes.osConfig = undefined;
    Kubernetes.masterUrl = "";
    Kubernetes.defaultApiVersion = "v1";
    Kubernetes.defaultOSApiVersion = "v1";
    Kubernetes.labelFilterTextSeparator = ",";
    Kubernetes.defaultNamespace = "default";
    Kubernetes.appSuffix = ".app";
    // kubernetes service names
    Kubernetes.kibanaServiceName = "kibana";
    Kubernetes.fabric8ForgeServiceName = "fabric8-forge";
    Kubernetes.gogsServiceName = "gogs";
    Kubernetes.jenkinsServiceName = "jenkins";
    Kubernetes.apimanServiceName = 'apiman';
    Kubernetes.isOpenShift = true;
    function kubernetesNamespacePath() {
        var ns = currentKubernetesNamespace();
        if (ns) {
            return "/namespaces/" + ns;
        }
        else {
            return "";
        }
    }
    Kubernetes.kubernetesNamespacePath = kubernetesNamespacePath;
    function apiPrefix() {
        var prefix = Core.pathGet(Kubernetes.osConfig, ['api', 'k8s', 'prefix']);
        if (!prefix) {
            prefix = 'api';
        }
        return Core.trimLeading(prefix, '/');
    }
    Kubernetes.apiPrefix = apiPrefix;
    function osApiPrefix() {
        var prefix = Core.pathGet(Kubernetes.osConfig, ['api', 'openshift', 'prefix']);
        if (!prefix) {
            prefix = 'oapi';
        }
        var answer = Core.trimLeading(prefix, '/');
        if (!Kubernetes.isOpenShift) {
            return UrlHelpers.join(apiPrefix(), Kubernetes.defaultOSApiVersion, "proxy", kubernetesNamespacePath(), "services/templates", answer);
        }
        return answer;
    }
    Kubernetes.osApiPrefix = osApiPrefix;
    function masterApiUrl() {
        return Kubernetes.masterUrl || "";
    }
    Kubernetes.masterApiUrl = masterApiUrl;
    /** WARNING - this excludes the host name - you probably want to use: kubernetesApiUrl() instead!! */
    function kubernetesApiPrefix() {
        return UrlHelpers.join(apiPrefix(), Kubernetes.defaultApiVersion);
    }
    Kubernetes.kubernetesApiPrefix = kubernetesApiPrefix;
    function openshiftApiPrefix() {
        return UrlHelpers.join(osApiPrefix(), Kubernetes.defaultOSApiVersion);
    }
    Kubernetes.openshiftApiPrefix = openshiftApiPrefix;
    function prefixForType(type) {
        if (type === Kubernetes.WatchTypes.NAMESPACES) {
            return kubernetesApiPrefix();
        }
        if (_.any(Kubernetes.NamespacedTypes.k8sTypes, function (t) { return t === type; })) {
            return kubernetesApiPrefix();
        }
        if (_.any(Kubernetes.NamespacedTypes.osTypes, function (t) { return t === type; })) {
            return openshiftApiPrefix();
        }
        // lets assume its an OpenShift extension type
        return openshiftApiPrefix();
    }
    Kubernetes.prefixForType = prefixForType;
    function kubernetesApiUrl() {
        return UrlHelpers.join(masterApiUrl(), kubernetesApiPrefix());
    }
    Kubernetes.kubernetesApiUrl = kubernetesApiUrl;
    function openshiftApiUrl() {
        return UrlHelpers.join(masterApiUrl(), openshiftApiPrefix());
    }
    Kubernetes.openshiftApiUrl = openshiftApiUrl;
    function resourcesUriForKind(type, ns) {
        if (ns === void 0) { ns = null; }
        if (!ns) {
            ns = currentKubernetesNamespace();
        }
        return UrlHelpers.join(masterApiUrl(), prefixForType(type), namespacePathForKind(type, ns));
    }
    Kubernetes.resourcesUriForKind = resourcesUriForKind;
    function uriTemplateForKubernetesKind(type) {
        var urlTemplate = '';
        switch (type) {
            case Kubernetes.WatchTypes.NAMESPACES:
            case "Namespaces":
                urlTemplate = UrlHelpers.join('namespaces');
                break;
            case Kubernetes.WatchTypes.OAUTH_CLIENTS:
            case "OAuthClients":
            case "OAuthClient":
                return UrlHelpers.join('oauthclients');
            case Kubernetes.WatchTypes.PROJECTS:
            case "Projects":
                urlTemplate = UrlHelpers.join('projects');
                break;
            default:
                urlTemplate = UrlHelpers.join('namespaces/:namespace', type, ':id');
        }
        return urlTemplate;
    }
    Kubernetes.uriTemplateForKubernetesKind = uriTemplateForKubernetesKind;
    function namespacePathForKind(type, ns) {
        var urlTemplate = '';
        switch (type) {
            case Kubernetes.WatchTypes.NAMESPACES:
            case "Namespaces":
            case "Namespace":
                return UrlHelpers.join('namespaces');
            case Kubernetes.WatchTypes.NODES:
            case "Nodes":
            case "node":
                return UrlHelpers.join('nodes');
            case Kubernetes.WatchTypes.PROJECTS:
            case "Projects":
            case "Project":
                return UrlHelpers.join('projects');
            case Kubernetes.WatchTypes.OAUTH_CLIENTS:
            case "OAuthClients":
            case "OAuthClient":
                return UrlHelpers.join('oauthclients');
            case Kubernetes.WatchTypes.PERSISTENT_VOLUMES:
            case "PersistentVolumes":
            case "PersistentVolume":
                return UrlHelpers.join('persistentvolumes');
            default:
                return UrlHelpers.join('namespaces', ns, type);
        }
    }
    Kubernetes.namespacePathForKind = namespacePathForKind;
    function updateOrCreateObject(object, KubernetesModel, success, error) {
        var kind = getKind(object);
        if (kind === "List") {
            Kubernetes.log.debug("Object is a list, deploying all objects");
            _.forEach(object.items, function (obj) {
                Kubernetes.log.debug("Deploying: ", obj);
                updateOrCreateObject(obj, KubernetesModel, success, error);
            });
            return;
        }
        if (!kind) {
            Kubernetes.log.debug("Object: ", object, " has no object type");
            return;
        }
        kind = kind.toLowerCase().pluralize();
        var resource = KubernetesModel[kind + 'Resource'];
        if (!resource) {
            var injector = HawtioCore.injector;
            var $resource = injector ? injector.get("$resource") : null;
            if (!$resource) {
                Kubernetes.log.warn("Cannot create resource for " + kind + " due to missing $resource");
                return;
            }
            resource = createResource(kind, uriTemplateForKubernetesKind(kind), $resource, KubernetesModel);
            KubernetesModel[kind + 'Resource'] = resource;
        }
        var name = getName(object);
        if (!name) {
            Kubernetes.log.debug("Object has no name: ", object);
            return;
        }
        var isUpdate = _.any(KubernetesModel[kind], function (n) { return n === name; });
        var action = isUpdate ? "Modified" : "Added";
        var successInternal = function (data) {
            Kubernetes.log.debug(action, data);
            if (!isUpdate && KubernetesModel[kind]) {
                KubernetesModel[kind].push(data);
            }
            if (success) {
                success(data);
            }
        };
        var errorInternal = function (err) {
            Kubernetes.log.debug("Failed to add/modify object: ", object, " error: ", err);
            if (error) {
                error(err);
            }
        };
        if (isUpdate) {
            Kubernetes.log.debug("Object already exists, updating...");
            resource.save({ id: name }, object, successInternal, errorInternal);
        }
        else {
            Kubernetes.log.debug("Object doesn't exist, creating...");
            resource.create({}, object, successInternal, errorInternal);
        }
    }
    Kubernetes.updateOrCreateObject = updateOrCreateObject;
    /**
     * Returns thevalue from the injector if its available or null
     */
    function inject(name) {
        var injector = HawtioCore.injector;
        return injector ? injector.get(name) : null;
    }
    Kubernetes.inject = inject;
    function createResource(thing, urlTemplate, $resource, KubernetesModel) {
        var prefix = prefixForType(thing);
        if (!prefix) {
            Kubernetes.log.debug("Invalid type given: ", thing);
            return null;
        }
        var params = {
            namespace: currentKubernetesNamespace
        };
        switch (thing) {
            case Kubernetes.WatchTypes.NAMESPACES:
            case Kubernetes.WatchTypes.OAUTH_CLIENTS:
            case Kubernetes.WatchTypes.NODES:
            case Kubernetes.WatchTypes.PROJECTS:
            case Kubernetes.WatchTypes.OAUTH_CLIENTS:
            case Kubernetes.WatchTypes.PERSISTENT_VOLUMES:
                params = {};
        }
        var url = UrlHelpers.join(masterApiUrl(), prefix, urlTemplate);
        Kubernetes.log.debug("Url for ", thing, ": ", url);
        var resource = $resource(url, null, {
            query: { method: 'GET', isArray: false, params: params },
            create: { method: 'POST', params: params },
            save: { method: 'PUT', params: params },
            delete: { method: 'DELETE', params: _.extend({
                    id: '@id'
                }, params) }
        });
        return resource;
    }
    Kubernetes.createResource = createResource;
    function imageRepositoriesRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/imagestreams");
    }
    Kubernetes.imageRepositoriesRestURL = imageRepositoriesRestURL;
    function deploymentConfigsRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/deploymentconfigs");
    }
    Kubernetes.deploymentConfigsRestURL = deploymentConfigsRestURL;
    function buildsRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/builds");
    }
    Kubernetes.buildsRestURL = buildsRestURL;
    function buildConfigHooksRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/buildconfighooks");
    }
    Kubernetes.buildConfigHooksRestURL = buildConfigHooksRestURL;
    function buildConfigsRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/buildconfigs");
    }
    Kubernetes.buildConfigsRestURL = buildConfigsRestURL;
    function routesRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/routes");
    }
    Kubernetes.routesRestURL = routesRestURL;
    function templatesRestURL() {
        return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/templates");
    }
    Kubernetes.templatesRestURL = templatesRestURL;
    function getNamespace(entity) {
        var answer = Core.pathGet(entity, ["metadata", "namespace"]);
        return answer ? answer : currentKubernetesNamespace();
    }
    Kubernetes.getNamespace = getNamespace;
    function getLabels(entity) {
        var answer = Core.pathGet(entity, ["metadata", "labels"]);
        return answer ? answer : {};
    }
    Kubernetes.getLabels = getLabels;
    function getName(entity) {
        if (angular.isString(entity)) {
            return entity;
        }
        return Core.pathGet(entity, ["metadata", "name"]) || Core.pathGet(entity, "name") || Core.pathGet(entity, "id");
    }
    Kubernetes.getName = getName;
    function getKind(entity) {
        return Core.pathGet(entity, ["metadata", "kind"]) || Core.pathGet(entity, "kind");
    }
    Kubernetes.getKind = getKind;
    function getSelector(entity) {
        return Core.pathGet(entity, ["spec", "selector"]);
    }
    Kubernetes.getSelector = getSelector;
    function getHost(pod) {
        return Core.pathGet(pod, ["spec", "host"]) || Core.pathGet(pod, ["spec", "nodeName"]) || Core.pathGet(pod, ["status", "hostIP"]);
    }
    Kubernetes.getHost = getHost;
    function getStatus(pod) {
        return Core.pathGet(pod, ["status", "phase"]);
    }
    Kubernetes.getStatus = getStatus;
    function getPorts(service) {
        return Core.pathGet(service, ["spec", "ports"]);
    }
    Kubernetes.getPorts = getPorts;
    function getCreationTimestamp(entity) {
        return Core.pathGet(entity, ["metadata", "creationTimestamp"]);
    }
    Kubernetes.getCreationTimestamp = getCreationTimestamp;
    ;
    //var fabricDomain = Fabric.jmxDomain;
    var fabricDomain = "io.fabric8";
    Kubernetes.mbean = fabricDomain + ":type=Kubernetes";
    Kubernetes.managerMBean = fabricDomain + ":type=KubernetesManager";
    Kubernetes.appViewMBean = fabricDomain + ":type=AppView";
    function isKubernetes(workspace) {
        // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "Kubernetes"});
        return true;
    }
    Kubernetes.isKubernetes = isKubernetes;
    function isKubernetesTemplateManager(workspace) {
        // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "KubernetesTemplateManager"});
        return true;
    }
    Kubernetes.isKubernetesTemplateManager = isKubernetesTemplateManager;
    function isAppView(workspace) {
        // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "AppView"});
        return true;
    }
    Kubernetes.isAppView = isAppView;
    function getStrippedPathName() {
        var pathName = Core.trimLeading((this.$location.path() || '/'), "#");
        pathName = pathName.replace(/^\//, '');
        return pathName;
    }
    Kubernetes.getStrippedPathName = getStrippedPathName;
    function linkContains() {
        var words = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            words[_i - 0] = arguments[_i];
        }
        var pathName = this.getStrippedPathName();
        return words.all(function (word) {
            return pathName.has(word);
        });
    }
    Kubernetes.linkContains = linkContains;
    /**
     * Returns true if the given link is active. The link can omit the leading # or / if necessary.
     * The query parameters of the URL are ignored in the comparison.
     * @method isLinkActive
     * @param {String} href
     * @return {Boolean} true if the given link is active
     */
    function isLinkActive(href) {
        // lets trim the leading slash
        var pathName = getStrippedPathName();
        var link = Core.trimLeading(href, "#");
        link = link.replace(/^\//, '');
        // strip any query arguments
        var idx = link.indexOf('?');
        if (idx >= 0) {
            link = link.substring(0, idx);
        }
        if (!pathName.length) {
            return link === pathName;
        }
        else {
            return pathName.startsWith(link);
        }
    }
    Kubernetes.isLinkActive = isLinkActive;
    function setJson($scope, id, collection) {
        $scope.id = id;
        if (!$scope.fetched) {
            return;
        }
        if (!id) {
            $scope.json = '';
            return;
        }
        if (!collection) {
            return;
        }
        var item = collection.find(function (item) { return getName(item) === id; });
        if (item) {
            $scope.json = angular.toJson(item, true);
            $scope.item = item;
        }
        else {
            $scope.id = undefined;
            $scope.json = '';
            $scope.item = undefined;
        }
    }
    Kubernetes.setJson = setJson;
    /**
     * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
     */
    function labelsToString(labels, seperatorText) {
        if (seperatorText === void 0) { seperatorText = Kubernetes.labelFilterTextSeparator; }
        var answer = "";
        angular.forEach(labels, function (value, key) {
            var separator = answer ? seperatorText : "";
            answer += separator + key + "=" + value;
        });
        return answer;
    }
    Kubernetes.labelsToString = labelsToString;
    function initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL) {
        $scope.baseUri = Core.trimTrailing(Core.url("/") || "", "/") || "";
        var injector = HawtioCore.injector;
        function hasService(name) {
            if (injector) {
                var ServiceRegistry = injector.get("ServiceRegistry");
                if (ServiceRegistry) {
                    return ServiceRegistry.hasService(name);
                }
            }
            return false;
        }
        $scope.hasServiceKibana = function () { return hasService(Kubernetes.kibanaServiceName); };
        $scope.hasServiceGogs = function () { return hasService(Kubernetes.gogsServiceName); };
        $scope.hasServiceForge = function () { return hasService(Kubernetes.fabric8ForgeServiceName); };
        $scope.hasServiceApiman = function () { return hasService(Kubernetes.apimanServiceName); };
        $scope.viewTemplates = function () {
            var returnTo = $location.url();
            $location.path('/kubernetes/templates').search({ 'returnTo': returnTo });
        };
        $scope.namespace = $routeParams.namespace || KubernetesState.selectedNamespace || Kubernetes.defaultNamespace;
        if ($scope.namespace != KubernetesState.selectedNamespace) {
            KubernetesState.selectedNamespace = $scope.namespace;
            // lets show page is going to reload
            if ($scope.model) {
                $scope.model.fetched = false;
            }
        }
        $scope.forgeEnabled = isForgeEnabled();
        $scope.projectId = $routeParams["project"] || $scope.projectId || $scope.id;
        var showProjectNavBars = false;
        if ($scope.projectId && showProjectNavBars) {
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.projectId);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.projectId, null, $scope);
        }
        else {
            $scope.breadcrumbConfig = Developer.createEnvironmentBreadcrumbs($scope, $location, $routeParams);
            $scope.subTabConfig = Developer.createEnvironmentSubNavBars($scope, $location, $routeParams);
        }
        if ($scope.projectId) {
            $scope.$projectLink = Developer.projectLink($scope.projectId);
        }
        $scope.codeMirrorOptions = {
            lineWrapping: true,
            lineNumbers: true,
            readOnly: 'nocursor',
            mode: { name: "javascript", json: true }
        };
        $scope.resizeDialog = {
            controller: null,
            newReplicas: 0,
            dialog: new UI.Dialog(),
            onOk: function () {
                var resizeDialog = $scope.resizeDialog;
                resizeDialog.dialog.close();
                resizeController($http, KubernetesApiURL, resizeDialog.controller, resizeDialog.newReplicas, function () { Kubernetes.log.debug("updated number of replicas"); });
            },
            open: function (controller) {
                var resizeDialog = $scope.resizeDialog;
                resizeDialog.controller = controller;
                resizeDialog.newReplicas = Core.pathGet(controller, ["status", "replicas"]);
                resizeDialog.dialog.open();
                $timeout(function () {
                    $('#replicas').focus();
                }, 50);
            },
            close: function () {
                $scope.resizeDialog.dialog.close();
            }
        };
        $scope.triggerBuild = function (buildConfig) {
            var url = buildConfig.$triggerUrl;
            console.log("triggering build at url: " + url);
            if (url) {
                //var data = {};
                var data = null;
                var config = {
                    headers: {
                        'Content-Type': "application/json"
                    }
                };
                var name = Core.pathGet(buildConfig, ["metadata", "name"]);
                Core.notification('info', "Triggering build " + name);
                $http.post(url, data, config).
                    success(function (data, status, headers, config) {
                    console.log("trigger worked! got data " + angular.toJson(data, true));
                    // TODO should we show some link to the build
                    Core.notification('info', "Building " + name);
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    Core.notification('error', "Failed to trigger build for " + name + ". Returned code: " + status + " " + data);
                });
            }
            ;
        };
        // update the URL if the filter is changed
        $scope.$watch("tableConfig.filterOptions.filterText", function (text) {
            $location.search("q", text);
        });
        $scope.$on("labelFilterUpdate", function ($event, text) {
            var filterOptions = ($scope.tableConfig || {}).filterOptions || {};
            var currentFilter = filterOptions.filterText;
            if (Core.isBlank(currentFilter)) {
                filterOptions.filterText = text;
            }
            else {
                var expressions = currentFilter.split(/\s+/);
                if (expressions.any(text)) {
                    // lets exclude this filter expression
                    expressions = expressions.remove(text);
                    filterOptions.filterText = expressions.join(" ");
                }
                else {
                    filterOptions.filterText = currentFilter + " " + text;
                }
            }
            $scope.id = undefined;
        });
    }
    Kubernetes.initShared = initShared;
    /**
     * Returns the number of pods that are ready
     */
    function readyPodCount(service) {
        var count = 0;
        angular.forEach((service || {}).$pods, function (pod) {
            if (pod.$ready) {
                count++;
            }
        });
        return count;
    }
    Kubernetes.readyPodCount = readyPodCount;
    /**
     * Returns the service link URL for either the service name or the service object
     */
    function serviceLinkUrl(service) {
        if (angular.isObject(service)) {
            var portalIP = service.$host;
            // lets assume no custom port for now for external routes
            var port = null;
            var protocol = "http://";
            var spec = service.spec;
            if (spec) {
                if (!portalIP) {
                    portalIP = spec.portalIP;
                }
                var hasHttps = false;
                var hasHttp = false;
                angular.forEach(spec.ports, function (portSpec) {
                    var p = portSpec.port;
                    if (p) {
                        if (p === 443) {
                            hasHttps = true;
                        }
                        else if (p === 80) {
                            hasHttp = true;
                        }
                        if (!port) {
                            port = p;
                        }
                    }
                });
            }
            if (portalIP) {
                if (hasHttps) {
                    return "https://" + portalIP;
                }
                else if (hasHttp) {
                    return "http://" + portalIP;
                }
                else if (port) {
                    return protocol + portalIP + ":" + port + "/";
                }
                else {
                    return protocol + portalIP;
                }
            }
        }
        else if (service) {
            var serviceId = service.toString();
            if (serviceId) {
                var ServiceRegistry = getServiceRegistry();
                if (ServiceRegistry) {
                    return ServiceRegistry.serviceLink(serviceId) || "";
                }
            }
        }
        return "";
    }
    Kubernetes.serviceLinkUrl = serviceLinkUrl;
    /**
     * Given the list of pods lets iterate through them and find all pods matching the selector
     * and return counters based on the status of the pod
     */
    function createPodCounters(selector, pods, outputPods, podLinkQuery, podLinkUrl) {
        if (outputPods === void 0) { outputPods = []; }
        if (podLinkQuery === void 0) { podLinkQuery = null; }
        if (podLinkUrl === void 0) { podLinkUrl = null; }
        if (!podLinkUrl) {
            podLinkUrl = "/kubernetes/pods";
        }
        var filterFn;
        if (angular.isFunction(selector)) {
            filterFn = selector;
        }
        else {
            filterFn = function (pod) { return selectorMatches(selector, getLabels(pod)); };
        }
        var answer = {
            podsLink: "",
            ready: 0,
            valid: 0,
            waiting: 0,
            error: 0
        };
        if (selector) {
            if (!podLinkQuery) {
                podLinkQuery = Kubernetes.labelsToString(selector, " ");
            }
            answer.podsLink = podLinkUrl + "?q=" + encodeURIComponent(podLinkQuery);
            angular.forEach(pods, function (pod) {
                if (filterFn(pod)) {
                    outputPods.push(pod);
                    var status = getStatus(pod);
                    if (status) {
                        var lower = status.toLowerCase();
                        if (lower.startsWith("run")) {
                            if (isReady(pod)) {
                                answer.ready += 1;
                            }
                            else {
                                answer.valid += 1;
                            }
                        }
                        else if (lower.startsWith("wait") || lower.startsWith("pend")) {
                            answer.waiting += 1;
                        }
                        else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
                            answer.error += 1;
                        }
                    }
                    else {
                        answer.error += 1;
                    }
                }
            });
        }
        return answer;
    }
    Kubernetes.createPodCounters = createPodCounters;
    /**
     * Converts the given json into an array of items. If the json contains a nested set of items then that is sorted; so that services
     * are processed first; then turned into an array. Otherwise the json is put into an array so it can be processed polymorphically
     */
    function convertKubernetesJsonToItems(json) {
        var items = json.items;
        if (angular.isArray(items)) {
            // TODO we could check for List or Config types here and warn if not
            // sort the services first
            var answer = [];
            items.forEach(function (item) {
                if (item.kind === "Service") {
                    answer.push(item);
                }
            });
            items.forEach(function (item) {
                if (item.kind !== "Service") {
                    answer.push(item);
                }
            });
            return answer;
        }
        else {
            return [json];
        }
    }
    Kubernetes.convertKubernetesJsonToItems = convertKubernetesJsonToItems;
    function isV1beta1Or2() {
        return Kubernetes.defaultApiVersion === "v1beta1" || Kubernetes.defaultApiVersion === "v1beta2";
    }
    Kubernetes.isV1beta1Or2 = isV1beta1Or2;
    /**
     * Returns a link to the detail page for the given entity
     */
    function entityPageLink(entity) {
        if (entity) {
            var viewLink = entity["$viewLink"];
            if (viewLink) {
                return viewLink;
            }
            var id = getName(entity);
            var kind = getKind(entity);
            if (kind && id) {
                var path = kind.substring(0, 1).toLowerCase() + kind.substring(1) + "s";
                var namespace = getNamespace(entity);
                if (namespace && !isIgnoreNamespaceKind(kind)) {
                    return Core.url(UrlHelpers.join('/kubernetes/namespace', namespace, path, id));
                }
                else {
                    return Core.url(UrlHelpers.join('/kubernetes', path, id));
                }
            }
        }
        return null;
    }
    Kubernetes.entityPageLink = entityPageLink;
    function resourceKindToUriPath(kind) {
        var kindPath = kind.toLowerCase() + "s";
        if (kindPath === "replicationControllers" && !isV1beta1Or2()) {
            kindPath = "replicationcontrollers";
        }
        return kindPath;
    }
    Kubernetes.resourceKindToUriPath = resourceKindToUriPath;
    function isIgnoreNamespaceKind(kind) {
        return kind === "Host" || kind === "Minion";
    }
    /**
     * Returns the root URL for the kind
     */
    function kubernetesUrlForKind(KubernetesApiURL, kind, namespace, path) {
        if (namespace === void 0) { namespace = null; }
        if (path === void 0) { path = null; }
        var pathSegment = "";
        if (path) {
            pathSegment = "/" + Core.trimLeading(path, "/");
        }
        var kindPath = resourceKindToUriPath(kind);
        var ignoreNamespace = isIgnoreNamespaceKind(kind);
        if (isV1beta1Or2() || ignoreNamespace) {
            var postfix = "";
            if (namespace && !ignoreNamespace) {
                postfix = "?namespace=" + namespace;
            }
            return UrlHelpers.join(KubernetesApiURL, kindPath, pathSegment, postfix);
        }
        else {
            return UrlHelpers.join(KubernetesApiURL, "/namespaces/", namespace, kindPath, pathSegment);
        }
    }
    Kubernetes.kubernetesUrlForKind = kubernetesUrlForKind;
    ;
    /**
     * Returns the base URL for the kind of kubernetes resource or null if it cannot be found
     */
    function kubernetesUrlForItemKind(KubernetesApiURL, json) {
        var kind = json.kind;
        if (kind) {
            return kubernetesUrlForKind(KubernetesApiURL, kind, json.namespace);
        }
        else {
            Kubernetes.log.warn("Ignoring missing kind " + kind + " for kubernetes json: " + angular.toJson(json));
            return null;
        }
    }
    Kubernetes.kubernetesUrlForItemKind = kubernetesUrlForItemKind;
    function kubernetesProxyUrlForService(KubernetesApiURL, service, path) {
        if (path === void 0) { path = null; }
        var pathSegment = "";
        if (path) {
            pathSegment = "/" + Core.trimLeading(path, "/");
        }
        else {
            pathSegment = "/";
        }
        var namespace = getNamespace(service);
        if (isV1beta1Or2()) {
            var postfix = "?namespace=" + namespace;
            return UrlHelpers.join(KubernetesApiURL, "/proxy", kubernetesNamespacePath(), "/services/" + getName(service) + pathSegment + postfix);
        }
        else {
            return UrlHelpers.join(KubernetesApiURL, "/proxy/namespaces/", namespace, "/services/" + getName(service) + pathSegment);
        }
    }
    Kubernetes.kubernetesProxyUrlForService = kubernetesProxyUrlForService;
    function kubernetesProxyUrlForServiceCurrentNamespace(service, path) {
        if (path === void 0) { path = null; }
        var apiPrefix = UrlHelpers.join(kubernetesApiUrl());
        return kubernetesProxyUrlForService(apiPrefix, service, path);
    }
    Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace = kubernetesProxyUrlForServiceCurrentNamespace;
    function buildConfigRestUrl(id) {
        return UrlHelpers.join(buildConfigsRestURL(), id);
    }
    Kubernetes.buildConfigRestUrl = buildConfigRestUrl;
    function deploymentConfigRestUrl(id) {
        return UrlHelpers.join(deploymentConfigsRestURL(), id);
    }
    Kubernetes.deploymentConfigRestUrl = deploymentConfigRestUrl;
    function imageRepositoryRestUrl(id) {
        return UrlHelpers.join(imageRepositoriesRestURL(), id);
    }
    Kubernetes.imageRepositoryRestUrl = imageRepositoryRestUrl;
    function buildRestUrl(id) {
        return UrlHelpers.join(buildsRestURL(), id);
    }
    Kubernetes.buildRestUrl = buildRestUrl;
    function buildLogsRestUrl(id) {
        return UrlHelpers.join(buildsRestURL(), id, "log");
    }
    Kubernetes.buildLogsRestUrl = buildLogsRestUrl;
    /**
     * Runs the given application JSON
     */
    function runApp($location, $scope, $http, KubernetesApiURL, json, name, onSuccessFn, namespace, onCompleteFn) {
        if (name === void 0) { name = "App"; }
        if (onSuccessFn === void 0) { onSuccessFn = null; }
        if (namespace === void 0) { namespace = null; }
        if (onCompleteFn === void 0) { onCompleteFn = null; }
        if (json) {
            if (angular.isString(json)) {
                json = angular.fromJson(json);
            }
            name = name || "App";
            var postfix = namespace ? " in namespace " + namespace : "";
            Core.notification('info', "Running " + name + postfix);
            var items = convertKubernetesJsonToItems(json);
            angular.forEach(items, function (item) {
                var url = kubernetesUrlForItemKind(KubernetesApiURL, item);
                if (url) {
                    $http.post(url, item).
                        success(function (data, status, headers, config) {
                        Kubernetes.log.debug("Got status: " + status + " on url: " + url + " data: " + data + " after posting: " + angular.toJson(item));
                        if (angular.isFunction(onCompleteFn)) {
                            onCompleteFn();
                        }
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        var message = null;
                        if (angular.isObject(data)) {
                            message = data.message;
                            var reason = data.reason;
                            if (reason === "AlreadyExists") {
                                // lets ignore duplicates
                                Kubernetes.log.debug("entity already exists at " + url);
                                return;
                            }
                        }
                        if (!message) {
                            message = "Failed to POST to " + url + " got status: " + status;
                        }
                        Kubernetes.log.warn("Failed to save " + url + " status: " + status + " response: " + angular.toJson(data, true));
                        Core.notification('error', message);
                    });
                }
            });
        }
    }
    Kubernetes.runApp = runApp;
    /**
     * Returns true if the current status of the pod is running
     */
    function isRunning(podCurrentState) {
        var status = (podCurrentState || {}).phase;
        if (status) {
            var lower = status.toLowerCase();
            return lower.startsWith("run");
        }
        else {
            return false;
        }
    }
    Kubernetes.isRunning = isRunning;
    /**
     * Returns true if the labels object has all of the key/value pairs from the selector
     */
    function selectorMatches(selector, labels) {
        if (angular.isObject(labels)) {
            var answer = true;
            var count = 0;
            angular.forEach(selector, function (value, key) {
                count++;
                if (answer && labels[key] !== value) {
                    answer = false;
                }
            });
            return answer && count > 0;
        }
        else {
            return false;
        }
    }
    Kubernetes.selectorMatches = selectorMatches;
    /**
     * Returns the service registry
     */
    function getServiceRegistry() {
        var injector = HawtioCore.injector;
        return injector ? injector.get("ServiceRegistry") : null;
    }
    Kubernetes.getServiceRegistry = getServiceRegistry;
    /**
     * Returns a link to the kibana logs web application
     */
    function kibanaLogsLink(ServiceRegistry) {
        var link = ServiceRegistry.serviceLink(Kubernetes.kibanaServiceName);
        if (link) {
            if (!link.endsWith("/")) {
                link += "/";
            }
            return link + "#/dashboard/Fabric8";
        }
        else {
            return null;
        }
    }
    Kubernetes.kibanaLogsLink = kibanaLogsLink;
    function openLogsForPods(ServiceRegistry, $window, namespace, pods) {
        var link = kibanaLogsLink(ServiceRegistry);
        if (link) {
            var query = "";
            var count = 0;
            angular.forEach(pods, function (item) {
                var id = getName(item);
                if (id) {
                    var space = query ? " OR " : "";
                    count++;
                    query += space + '"' + id + '"';
                }
            });
            if (query) {
                if (count > 1) {
                    query = "(" + query + ")";
                }
                query = 'kubernetes.namespace:"' + namespace + '" AND kubernetes.pod_name:' + query;
                link += "?_a=(query:(query_string:(query:'" + query + "')))";
                var newWindow = $window.open(link, "viewLogs");
            }
        }
    }
    Kubernetes.openLogsForPods = openLogsForPods;
    function resizeController($http, KubernetesApiURL, replicationController, newReplicas, onCompleteFn) {
        if (onCompleteFn === void 0) { onCompleteFn = null; }
        var id = getName(replicationController);
        var namespace = getNamespace(replicationController) || "";
        var url = kubernetesUrlForKind(KubernetesApiURL, "ReplicationController", namespace, id);
        $http.get(url).
            success(function (data, status, headers, config) {
            if (data) {
                var desiredState = data.spec;
                if (!desiredState) {
                    desiredState = {};
                    data.spec = desiredState;
                }
                desiredState.replicas = newReplicas;
                $http.put(url, data).
                    success(function (data, status, headers, config) {
                    Kubernetes.log.debug("updated controller " + url);
                    if (angular.isFunction(onCompleteFn)) {
                        onCompleteFn();
                    }
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to save " + url + " " + data + " " + status);
                });
            }
        }).
            error(function (data, status, headers, config) {
            Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
        });
    }
    Kubernetes.resizeController = resizeController;
    function statusTextToCssClass(text, ready) {
        if (ready === void 0) { ready = false; }
        if (text) {
            var lower = text.toLowerCase();
            if (lower.startsWith("run") || lower.startsWith("ok")) {
                if (!ready) {
                    return "fa fa-spinner fa-spin green";
                }
                return 'fa fa-play-circle green';
            }
            else if (lower.startsWith("wait") || lower.startsWith("pend")) {
                return 'fa fa-download';
            }
            else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
                return 'fa fa-off orange';
            }
            else if (lower.startsWith("succeeded")) {
                return 'fa fa-check-circle-o green';
            }
        }
        return 'fa fa-question red';
    }
    Kubernetes.statusTextToCssClass = statusTextToCssClass;
    function podStatus(pod) {
        return getStatus(pod);
    }
    Kubernetes.podStatus = podStatus;
    function isReady(pod) {
        var status = pod.status || {};
        var answer = false;
        angular.forEach(status.conditions, function (condition) {
            var t = condition.type;
            if (t && t === "Ready") {
                var status = condition.status;
                if (status === "True") {
                    answer = true;
                }
            }
        });
        return answer;
    }
    Kubernetes.isReady = isReady;
    function createAppViewPodCounters(appView) {
        var array = [];
        var map = {};
        var pods = appView.pods;
        var lowestDate = null;
        angular.forEach(pods, function (pod) {
            var selector = getLabels(pod);
            var selectorText = Kubernetes.labelsToString(selector, " ");
            var answer = map[selector];
            if (!answer) {
                answer = {
                    labelText: selectorText,
                    podsLink: Core.url("/kubernetes/pods?q=" + encodeURIComponent(selectorText)),
                    valid: 0,
                    waiting: 0,
                    error: 0
                };
                map[selector] = answer;
                array.push(answer);
            }
            var status = (podStatus(pod) || "Error").toLowerCase();
            if (status.startsWith("run") || status.startsWith("ok")) {
                answer.valid += 1;
            }
            else if (status.startsWith("wait") || status.startsWith("pwnd")) {
                answer.waiting += 1;
            }
            else {
                answer.error += 1;
            }
            var creationTimestamp = getCreationTimestamp(pod);
            if (creationTimestamp) {
                var d = new Date(creationTimestamp);
                if (!lowestDate || d < lowestDate) {
                    lowestDate = d;
                }
            }
        });
        appView.$creationDate = lowestDate;
        return array;
    }
    Kubernetes.createAppViewPodCounters = createAppViewPodCounters;
    function createAppViewServiceViews(appView) {
        var array = [];
        var pods = appView.pods;
        angular.forEach(pods, function (pod) {
            var id = getName(pod);
            if (id) {
                var abbrev = id;
                var idx = id.indexOf("-");
                if (idx > 1) {
                    abbrev = id.substring(0, idx);
                }
                pod.idAbbrev = abbrev;
            }
            pod.statusClass = statusTextToCssClass(podStatus(pod), isReady(pod));
        });
        var services = appView.services || [];
        var replicationControllers = appView.replicationControllers || [];
        var size = Math.max(services.length, replicationControllers.length, 1);
        var appName = appView.$info.name;
        for (var i = 0; i < size; i++) {
            var service = services[i];
            var replicationController = replicationControllers[i];
            var controllerId = getName(replicationController);
            var name = getName(service) || controllerId;
            var address = Core.pathGet(service, ["spec", "portalIP"]);
            if (!name && pods.length) {
                name = pods[0].idAbbrev;
            }
            if (!appView.$info.name) {
                appView.$info.name = name;
            }
            if (!appView.id && pods.length) {
                appView.id = getName(pods[0]);
            }
            if (i > 0) {
                appName = name;
            }
            var podCount = pods.length;
            var podCountText = podCount + " pod" + (podCount > 1 ? "s" : "");
            var view = {
                appName: appName || name,
                name: name,
                createdDate: appView.$creationDate,
                podCount: podCount,
                podCountText: podCountText,
                address: address,
                controllerId: controllerId,
                service: service,
                replicationController: replicationController,
                pods: pods
            };
            array.push(view);
        }
        return array;
    }
    Kubernetes.createAppViewServiceViews = createAppViewServiceViews;
    /**
     * converts a git path into an accessible URL for the browser
     */
    function gitPathToUrl(iconPath, branch) {
        if (branch === void 0) { branch = "master"; }
        return (HawtioCore.injector.get('AppLibraryURL') || '') + "/git/" + branch + iconPath;
    }
    Kubernetes.gitPathToUrl = gitPathToUrl;
    function asDate(value) {
        return value ? new Date(value) : null;
    }
    function enrichBuildConfig(buildConfig, sortedBuilds) {
        if (buildConfig) {
            var triggerUrl = null;
            var metadata = buildConfig.metadata || {};
            var name = metadata.name;
            buildConfig.$name = name;
            var projectLink = Developer.projectLink(name);
            var ns = metadata.namespace || currentKubernetesNamespace();
            buildConfig.$namespace = ns;
            buildConfig.environments = [];
            buildConfig.$creationDate = asDate(Kubernetes.getCreationTimestamp(buildConfig));
            buildConfig.$labelsText = Kubernetes.labelsToString(getLabels(buildConfig));
            if (name) {
                buildConfig.$viewLink = UrlHelpers.join("workspaces", ns, "projects", name, "environments");
                buildConfig.$editLink = UrlHelpers.join("workspaces", ns, "projects", name, "buildConfigEdit");
                angular.forEach([false, true], function (flag) {
                    angular.forEach(buildConfig.triggers, function (trigger) {
                        if (!triggerUrl) {
                            var type = trigger.type;
                            if (type === "generic" || flag) {
                                var generic = trigger[type];
                                if (type && generic) {
                                    var secret = generic.secret;
                                    if (secret) {
                                        triggerUrl = UrlHelpers.join(buildConfigHooksRestURL(), name, secret, type);
                                        buildConfig.$triggerUrl = triggerUrl;
                                    }
                                }
                            }
                        }
                    });
                });
                // lets find the latest build...
                if (sortedBuilds) {
                    buildConfig.$lastBuild = _.find(sortedBuilds, {
                        metadata: {
                            labels: {
                                buildconfig: name
                            }
                        }
                    });
                }
            }
            var $fabric8Views = {};
            function defaultPropertiesIfNotExist(name, object, autoCreate) {
                if (autoCreate === void 0) { autoCreate = false; }
                var view = $fabric8Views[name];
                if (autoCreate && !view) {
                    view = {};
                    $fabric8Views[name] = view;
                }
                if (view) {
                    angular.forEach(object, function (value, property) {
                        var current = view[property];
                        if (!current) {
                            view[property] = value;
                        }
                    });
                }
            }
            function defaultPropertiesIfNotExistStartsWith(prefix, object, autoCreate) {
                if (autoCreate === void 0) { autoCreate = false; }
                angular.forEach($fabric8Views, function (view, name) {
                    if (view && name.startsWith(prefix)) {
                        angular.forEach(object, function (value, property) {
                            var current = view[property];
                            if (!current) {
                                view[property] = value;
                            }
                        });
                    }
                });
            }
            var labels = metadata.labels || {};
            var annotations = metadata.annotations || {};
            // lets default the repo and user
            buildConfig.$user = annotations["fabric8.jenkins/user"] || labels["user"];
            buildConfig.$repo = annotations["fabric8.jenkins/repo"] || labels["repo"];
            angular.forEach(annotations, function (value, key) {
                var parts = key.split('/', 2);
                if (parts.length > 1) {
                    var linkId = parts[0];
                    var property = parts[1];
                    if (linkId && property && linkId.startsWith("fabric8.link")) {
                        var link = $fabric8Views[linkId];
                        if (!link) {
                            link = {
                                class: linkId
                            };
                            $fabric8Views[linkId] = link;
                        }
                        link[property] = value;
                    }
                }
            });
            if (buildConfig.$user && buildConfig.$repo) {
                // browse gogs repo view
                var gogsUrl = serviceLinkUrl(Kubernetes.gogsServiceName);
                if (gogsUrl) {
                    defaultPropertiesIfNotExist("fabric8.link.browseGogs.view", {
                        label: "Browse...",
                        url: UrlHelpers.join(gogsUrl, buildConfig.$user, buildConfig.$repo),
                        description: "Browse the source code of this repository",
                        iconClass: "fa fa-external-link"
                    }, true);
                }
                // run forge commands view
                defaultPropertiesIfNotExist("fabric8.link.forgeCommand.view", {
                    label: "Command...",
                    url: UrlHelpers.join(projectLink, "/forge/commands/user", buildConfig.$user, buildConfig.$repo),
                    description: "Perform an action on this project",
                    iconClass: "fa fa-play-circle"
                }, true);
                // configure devops view
                defaultPropertiesIfNotExist("fabric8.link.forgeCommand.devops.settings", {
                    label: "Settings",
                    url: UrlHelpers.join(projectLink, "/forge/command/devops-edit/user", buildConfig.$user, buildConfig.$repo),
                    description: "Configure the DevOps settings for this project",
                    iconClass: "fa fa-pencil-square-o"
                }, true);
            }
            // add some icons and descriptions
            defaultPropertiesIfNotExist("fabric8.link.repository.browse", {
                label: "Browse...",
                description: "Browse the source code of this repository",
                iconClass: "fa fa-external-link"
            });
            defaultPropertiesIfNotExist("fabric8.link.jenkins.job", {
                iconClass: "fa fa-tasks",
                description: "View the Jenkins Job for this build"
            });
            defaultPropertiesIfNotExist("fabric8.link.jenkins.monitor", {
                iconClass: "fa fa-tachometer",
                description: "View the Jenkins Monitor dashboard for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.jenkins.pipeline", {
                iconClass: "fa fa-arrow-circle-o-right",
                description: "View the Jenkins Pipeline for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.letschat.room", {
                iconClass: "fa fa-comment",
                description: "Chat room for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.letschat.room", {
                iconClass: "fa fa-comment",
                description: "Chat room for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.taiga", {
                iconClass: "fa fa-check-square-o",
                description: "Issue tracker for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.issues", {
                iconClass: "fa fa-check-square-o",
                description: "Issues for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.releases", {
                iconClass: "fa fa-tag",
                description: "Issues for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.taiga.team", {
                iconClass: "fa fa-users",
                description: "Team members for this project"
            });
            defaultPropertiesIfNotExist("fabric8.link.team", {
                iconClass: "fa fa-users",
                description: "Team members for this project"
            });
            defaultPropertiesIfNotExistStartsWith("fabric8.link.environment.", {
                iconClass: "fa fa-cloud",
                description: "The kubernetes namespace for this environment"
            });
            // lets put the views into sections...
            var $fabric8CodeViews = {};
            var $fabric8BuildViews = {};
            var $fabric8TeamViews = {};
            var $fabric8EnvironmentViews = {};
            angular.forEach($fabric8Views, function (value, key) {
                var view;
                if (key.indexOf("taiga") > 0 || key.indexOf(".issue") > 0 || key.indexOf("letschat") > 0 || key.indexOf(".team") > 0) {
                    view = $fabric8TeamViews;
                }
                else if (key.indexOf("jenkins") > 0) {
                    view = $fabric8BuildViews;
                }
                else if (key.indexOf(".environment.") > 0) {
                    view = $fabric8EnvironmentViews;
                }
                else {
                    view = $fabric8CodeViews;
                }
                view[key] = value;
            });
            buildConfig.$fabric8Views = $fabric8Views;
            buildConfig.$fabric8CodeViews = $fabric8CodeViews;
            buildConfig.$fabric8BuildViews = $fabric8BuildViews;
            buildConfig.$fabric8EnvironmentViews = $fabric8EnvironmentViews;
            buildConfig.$fabric8TeamViews = $fabric8TeamViews;
            var $jenkinsJob = annotations["fabric8.io/jenkins-job"];
            if (!$jenkinsJob && $fabric8Views["fabric8.link.jenkins.job"]) {
                $jenkinsJob = name;
            }
            buildConfig.$jenkinsJob = $jenkinsJob;
            angular.forEach($fabric8EnvironmentViews, function (env) {
                var c = env.class;
                var prefix = "fabric8.link.environment.";
                if (c && c.startsWith(prefix)) {
                    var ens = c.substring(prefix.length);
                    env.namespace = ens;
                    env.url = UrlHelpers.join("/workspaces", ns, "projects", name, "namespace", ens);
                }
                buildConfig.environments.push(env);
            });
            buildConfig.environments = buildConfig.environments.reverse();
            buildConfig.tools = [];
            angular.forEach($fabric8CodeViews, function (env) {
                buildConfig.tools.push(env);
            });
            angular.forEach($fabric8TeamViews, function (env) {
                buildConfig.tools.push(env);
            });
        }
    }
    Kubernetes.enrichBuildConfig = enrichBuildConfig;
    function enrichBuildConfigs(buildConfigs, sortedBuilds) {
        if (sortedBuilds === void 0) { sortedBuilds = null; }
        angular.forEach(buildConfigs, function (buildConfig) {
            enrichBuildConfig(buildConfig, sortedBuilds);
        });
        return buildConfigs;
    }
    Kubernetes.enrichBuildConfigs = enrichBuildConfigs;
    function enrichBuilds(builds) {
        angular.forEach(builds, function (build) {
            enrichBuild(build);
        });
        return _.sortBy(builds, "$creationDate").reverse();
    }
    Kubernetes.enrichBuilds = enrichBuilds;
    function enrichBuild(build) {
        if (build) {
            var metadata = build.metadata || {};
            var name = getName(build);
            var namespace = getNamespace(build);
            build.$name = name;
            build.$namespace = namespace;
            var nameArray = name.split("-");
            var nameArrayLength = nameArray.length;
            build.$shortName = (nameArrayLength > 4) ? nameArray.slice(0, nameArrayLength - 4).join("-") : name.substring(0, 30);
            var labels = getLabels(build);
            var configId = labels.buildconfig;
            build.$configId = configId;
            if (configId) {
                //build.$configLink = UrlHelpers.join("kubernetes/buildConfigs", configId);
                build.$configLink = UrlHelpers.join("workspaces", currentKubernetesNamespace(), "projects", configId);
            }
            var creationTimestamp = getCreationTimestamp(build);
            if (creationTimestamp) {
                var d = new Date(creationTimestamp);
                build.$creationDate = d;
            }
            if (name) {
                //build.$viewLink = UrlHelpers.join("kubernetes/builds", name);
                var projectLink = UrlHelpers.join("workspaces", currentKubernetesNamespace(), "projects", configId);
                build.$viewLink = UrlHelpers.join(projectLink, "builds", name);
                //build.$logsLink = UrlHelpers.join("kubernetes/buildLogs", name);
                build.$logsLink = UrlHelpers.join(projectLink, "buildLogs", name);
            }
            var podName = build.podName;
            if (podName && namespace) {
                var podNameArray = podName.split("-");
                var podNameArrayLength = podNameArray.length;
                build.$podShortName = (podNameArrayLength > 5) ? podNameArray[podNameArrayLength - 5] : podName.substring(0, 30);
                build.$podLink = UrlHelpers.join("kubernetes/namespace", namespace, "pods", podName);
            }
        }
        return build;
    }
    Kubernetes.enrichBuild = enrichBuild;
    function enrichDeploymentConfig(deploymentConfig) {
        if (deploymentConfig) {
            var triggerUrl = null;
            var name = Core.pathGet(deploymentConfig, ["metadata", "name"]);
            deploymentConfig.$name = name;
            var found = false;
            angular.forEach(deploymentConfig.triggers, function (trigger) {
                var type = trigger.type;
                if (!deploymentConfig.$imageChangeParams && type === "ImageChange") {
                    var imageChangeParams = trigger.imageChangeParams;
                    if (imageChangeParams) {
                        var containerNames = imageChangeParams.containerNames || [];
                        imageChangeParams.$containerNames = containerNames.join(" ");
                        deploymentConfig.$imageChangeParams = imageChangeParams;
                    }
                }
            });
        }
    }
    Kubernetes.enrichDeploymentConfig = enrichDeploymentConfig;
    function enrichDeploymentConfigs(deploymentConfigs) {
        angular.forEach(deploymentConfigs, function (deploymentConfig) {
            enrichDeploymentConfig(deploymentConfig);
        });
        return deploymentConfigs;
    }
    Kubernetes.enrichDeploymentConfigs = enrichDeploymentConfigs;
    function enrichEvent(event) {
        if (event) {
            var metadata = event.metadata || {};
            var firstTimestamp = event.firstTimestamp;
            if (firstTimestamp) {
                var d = new Date(firstTimestamp);
                event.$firstTimestamp = d;
            }
            var lastTimestamp = event.lastTimestamp;
            if (lastTimestamp) {
                var d = new Date(lastTimestamp);
                event.$lastTimestamp = d;
            }
            var labels = angular.copy(event.source || {});
            var involvedObject = event.involvedObject || {};
            var name = involvedObject.name;
            var kind = involvedObject.kind;
            if (name) {
                labels['name'] = name;
            }
            if (kind) {
                labels['kind'] = kind;
            }
            event.$labelsText = Kubernetes.labelsToString(labels);
        }
    }
    Kubernetes.enrichEvent = enrichEvent;
    function enrichEvents(events, model) {
        if (model === void 0) { model = null; }
        angular.forEach(events, function (event) {
            enrichEvent(event);
        });
        // lets update links to the events for each pod and RC
        if (model) {
            function clearEvents(entity) {
                entity.$events = [];
                entity.$eventsLink = null;
                entity.$eventCount = 0;
            }
            function updateEvent(entity, event) {
                if (entity) {
                    entity.$events.push(event);
                    if (!entity.$eventsLink) {
                        entity.$eventsLink = UrlHelpers.join("/kubernetes/namespace/", currentKubernetesNamespace(), "events") + "?q=kind%3D" + entity.kind + "%20name%3D" + entity.metadata.name;
                    }
                    entity.$eventCount = entity.$events.length;
                }
            }
            var pods = model.pods || [];
            var rcs = model.replicationControllers || [];
            angular.forEach(pods, clearEvents);
            angular.forEach(rcs, clearEvents);
            angular.forEach(events, function (event) {
                var involvedObject = event.involvedObject || {};
                var name = involvedObject.name;
                var kind = involvedObject.kind;
                var ns = model.currentNamespace();
                if (name && kind && ns) {
                    var entity = null;
                    if (kind === "ReplicationController") {
                        entity = model.getReplicationController(ns, name);
                    }
                    else if (kind === "Pod") {
                        entity = model.getPod(ns, name);
                    }
                    if (entity) {
                        updateEvent(entity, event);
                    }
                }
            });
        }
        return events;
    }
    Kubernetes.enrichEvents = enrichEvents;
    function enrichImageRepository(imageRepository) {
        if (imageRepository) {
            var triggerUrl = null;
            var name = Core.pathGet(imageRepository, ["metadata", "name"]);
            imageRepository.$name = name;
        }
    }
    Kubernetes.enrichImageRepository = enrichImageRepository;
    function enrichImageRepositories(imageRepositories) {
        angular.forEach(imageRepositories, function (imageRepository) {
            enrichImageRepository(imageRepository);
        });
        return imageRepositories;
    }
    Kubernetes.enrichImageRepositories = enrichImageRepositories;
    var labelColors = {
        'version': 'background-blue',
        'name': 'background-light-green',
        'container': 'background-light-grey'
    };
    function containerLabelClass(labelType) {
        if (!(labelType in labelColors)) {
            return 'mouse-pointer';
        }
        else
            return labelColors[labelType] + ' mouse-pointer';
    }
    Kubernetes.containerLabelClass = containerLabelClass;
    /**
     * Returns true if the fabric8 forge plugin is enabled
     */
    function isForgeEnabled() {
        // TODO should return true if the service "fabric8-forge" is valid
        return true;
    }
    Kubernetes.isForgeEnabled = isForgeEnabled;
    /**
     * Returns the current kubernetes selected namespace or the default one
     */
    function currentKubernetesNamespace() {
        var injector = HawtioCore.injector;
        if (injector) {
            var KubernetesState = injector.get("KubernetesState") || {};
            return KubernetesState.selectedNamespace || Kubernetes.defaultNamespace;
        }
        return Kubernetes.defaultNamespace;
    }
    Kubernetes.currentKubernetesNamespace = currentKubernetesNamespace;
    /**
     * Configures the json schema
     */
    function configureSchema() {
        angular.forEach(Kubernetes.schema.definitions, function (definition, name) {
            var properties = definition.properties;
            if (properties) {
                var hideProperties = ["creationTimestamp", "kind", "apiVersion", "annotations", "additionalProperties", "namespace", "resourceVersion", "selfLink", "uid"];
                angular.forEach(hideProperties, function (propertyName) {
                    var property = properties[propertyName];
                    if (property) {
                        property["hidden"] = true;
                    }
                });
                angular.forEach(properties, function (property, propertyName) {
                    var ref = property["$ref"];
                    var type = property["type"];
                    if (ref && (!type || type === "object")) {
                        property["type"] = ref;
                    }
                    if (type === "array") {
                        var items = property["items"];
                        if (items) {
                            var ref = items["$ref"];
                            var type = items["type"];
                            if (ref && (!type || type === "object")) {
                                items["type"] = ref;
                            }
                        }
                    }
                });
            }
            Kubernetes.schema.definitions.os_build_WebHookTrigger.properties.secret.type = "password";
        });
    }
    Kubernetes.configureSchema = configureSchema;
    /**
     * Lets remove any enriched data to leave the original json intact
     */
    function toRawJson(item) {
        var o = angular.copy(item);
        angular.forEach(o, function (value, key) {
            if (key.startsWith("$") || key.startsWith("_")) {
                delete o[key];
            }
        });
        return JSON.stringify(o, null, 2); // spacing level = 2
    }
    Kubernetes.toRawJson = toRawJson;
    function watch($scope, $element, kind, ns, fn, labelSelector) {
        if (labelSelector === void 0) { labelSelector = null; }
        var connection = KubernetesAPI.watch({
            kind: kind,
            namespace: ns,
            labelSelector: labelSelector,
            success: function (objects) {
                fn(objects);
                Core.$apply($scope);
            }
        });
        $element.on('$destroy', function () {
            console.log("Static controller[" + kind + ", " + ns + "] element destroyed");
            $scope.$destroy();
        });
        $scope.$on('$destroy', function () {
            console.log("Static controller[" + kind + ", " + ns + "] scope destroyed");
            connection.disconnect();
        });
        var oldDeleteScopeFn = $scope.deleteScope;
        $scope.deleteScope = function () {
            $element.remove();
            if (angular.isFunction(oldDeleteScopeFn)) {
                oldDeleteScopeFn();
            }
        };
    }
    Kubernetes.watch = watch;
    function createKubernetesClient(kind, ns) {
        if (ns === void 0) { ns = null; }
        var K8SClientFactory = inject("K8SClientFactory");
        if (!K8SClientFactory) {
            Kubernetes.log.warn("Could not find injected K8SClientFactory!");
            return null;
        }
        if (kind === "projects") {
            ns = null;
        }
        else if (!ns) {
            ns = Kubernetes.currentKubernetesNamespace();
        }
        return K8SClientFactory.create(kind, ns);
    }
    Kubernetes.createKubernetesClient = createKubernetesClient;
    function currentUserName() {
        var userDetails = HawtioOAuth.getUserProfile();
        var answer = null;
        if (userDetails) {
            answer = getName(userDetails);
        }
        return answer || "admin";
    }
    Kubernetes.currentUserName = currentUserName;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.HomeController = Developer.controller("HomeController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.namespace = Kubernetes.currentKubernetesNamespace();
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.JenkinsJobController = Developer.controller("JenkinsJobController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) {
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
            $scope.$on('$routeUpdate', function ($event) {
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
                    var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, "api/json?depth=1"));
                    if (url && (!$scope.job || Kubernetes.keepPollingModel)) {
                        $http.get(url).
                            success(function (data, status, headers, config) {
                            if (data) {
                                Developer.enrichJenkinsJob(data, $scope.id, $scope.jobId);
                                if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                                    Developer.log.info("entity has changed!");
                                    $scope.job = data;
                                }
                            }
                            $scope.model.fetched = true;
                            Core.$apply($scope);
                        }).
                            error(function (data, status, headers, config) {
                            Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                        });
                    }
                }
                else {
                    $scope.model.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.JenkinsJobsController = Developer.controller("JenkinsJobsController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.jenkins = null;
            $scope.entityChangedCache = {};
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs();
            $scope.subTabConfig = Developer.createWorkspaceSubNavBars();
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.tableConfig = {
                data: 'jenkins.jobs',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("jenkinsJobNameTemplate.html")
                    },
                    {
                        field: '$buildLink',
                        displayName: 'Views',
                        cellTemplate: $templateCache.get("jenkinsJobButtonsTemplate.html")
                    },
                    {
                        field: '$lastSuccessfulBuildNumber',
                        displayName: 'Last Success',
                        cellTemplate: $templateCache.get("jenkinsLastSuccessTemplate.html")
                    },
                    {
                        field: '$lastFailedlBuildNumber',
                        displayName: 'Last Failure',
                        cellTemplate: $templateCache.get("jenkinsLastFailureTemplate.html")
                    },
                    {
                        field: '$duration',
                        displayName: 'Last Duration',
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
                // TODO only need depth 2 to be able to fetch the lastBuild
                var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, "api/json?depth=2");
                Developer.log.info("");
                if (url && (!$scope.jenkins || Kubernetes.keepPollingModel)) {
                    $http.get(url, Developer.jenkinsHttpConfig).
                        success(function (data, status, headers, config) {
                        if (data) {
                            Developer.enrichJenkinsJobs(data, $scope.id, $scope.id);
                            if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                                Developer.log.info("entity has changed!");
                                $scope.jenkins = data;
                            }
                        }
                        $scope.model.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.JenkinsLogController = Developer.controller("JenkinsLogController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "$modal", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, $modal, KubernetesApiURL, ServiceRegistry) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.entityChangedCache = {};
            $scope.log = {
                html: "",
                start: 0,
                firstIdx: null
            };
            $scope.$on('kubernetesModelUpdated', function () {
                updateJenkinsLink();
                Core.$apply($scope);
            });
            /*
            
                    $scope.$on('jenkinsSelectedBuild', (event, build) => {
                      log.info("==== jenkins build selected! " + build.id + " " + build.$jobId);
                      $scope.selectedBuild = build;
                    });
            
            */
            $scope.$watch('selectedBuild', function () {
                $scope.fetch();
            });
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createJenkinsBreadcrumbs($scope.id, getJobId(), getBuildId());
            $scope.subTabConfig = Developer.createJenkinsSubNavBars($scope.id, getJobId(), getBuildId(), {
                label: "Log",
                title: "Views the logs of this build"
            });
            function getJobId() {
                // lets allow the parent scope to be used too for when this is used as a panel
                return $routeParams["job"] || ($scope.selectedBuild || {}).$jobId;
            }
            function getBuildId() {
                // lets allow the parent scope to be used too for when this is used as a panel
                return $routeParams["build"] || ($scope.selectedBuild || {}).id;
            }
            function updateJenkinsLink() {
                var jenkinsUrl = Developer.jenkinsLink();
                if (jenkinsUrl) {
                    $scope.$viewJenkinsBuildLink = UrlHelpers.join(jenkinsUrl, "job", getJobId(), getBuildId());
                    $scope.$viewJenkinsLogLink = UrlHelpers.join($scope.$viewJenkinsBuildLink, "console");
                }
            }
            var querySize = 50000;
            $scope.approve = function (url, operation) {
                var modal = $modal.open({
                    templateUrl: UrlHelpers.join(Developer.templatePath, 'jenkinsApproveModal.html'),
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.operation = operation;
                            $scope.header = operation + "?";
                            $scope.ok = function () {
                                modal.close();
                                postToJenkins(url, operation);
                            };
                            $scope.cancel = function () {
                                modal.dismiss();
                            };
                        }]
                });
            };
            function postToJenkins(uri, operation) {
                var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, uri);
                if (url) {
                    var body = null;
                    var config = {
                        headers: {}
                    };
                    Developer.log.info("posting to jenkinsUrl: " + url);
                    $http.post(url, body, config).
                        success(function (data, status, headers, config) {
                        Developer.log.info("Managed to " + operation + " at " + url);
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed " + operation + " job at " + url + " " + data + " " + status);
                    });
                }
                else {
                    Developer.log.warn("Cannot post to jenkins URI: " + uri + " as no jenkins found!");
                }
            }
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                var buildId = getBuildId();
                var jobId = getJobId();
                //log.info("=== jenkins log querying job " + jobId + " build " + buildId + " selected build " +  $scope.selectedBuild);
                if (jobId && buildId) {
                    if ($scope.buildId !== buildId || $scope.jobId !== jobId) {
                        // lets clear the query
                        $scope.log = {
                            html: "",
                            start: 0,
                            firstIdx: null
                        };
                    }
                    $scope.buildId = buildId;
                    $scope.jobId = jobId;
                    var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, UrlHelpers.join("job", jobId, buildId, "fabric8/logHtml?tail=1&start=" + $scope.log.start + "&size=" + querySize));
                    if ($scope.log.firstIdx !== null) {
                        url += "&first=" + $scope.log.firstIdx;
                    }
                    if (url && (!$scope.log.fetched || Kubernetes.keepPollingModel)) {
                        $http.get(url).
                            success(function (data, status, headers, config) {
                            if (data) {
                                var replaceClusterIPsInHtml = replaceClusterIpFunction();
                                if (!$scope.log.logs) {
                                    $scope.log.logs = [];
                                }
                                var lines = data.lines;
                                var returnedLength = data.returnedLength;
                                var logLength = data.logLength;
                                var returnedStart = data.start;
                                var earlierLog = false;
                                if (angular.isDefined(returnedStart)) {
                                    earlierLog = returnedStart < $scope.log.start;
                                }
                                var lineSplit = data.lineSplit;
                                // log.info("start was: " + $scope.log.start + " first: " + $scope.log.firstIdx + " => returnedLength: " + returnedLength + " logLength: " + logLength +  " returnedStart: " + returnedStart + " earlierLog: " + earlierLog + " lineSplit: " + lineSplit);
                                if (lines) {
                                    var currentLogs = $scope.log.logs;
                                    // lets re-join split lines
                                    if (lineSplit && currentLogs.length) {
                                        var lastIndex;
                                        var restOfLine;
                                        if (earlierLog) {
                                            lastIndex = 0;
                                            restOfLine = lines.pop();
                                            if (restOfLine) {
                                                currentLogs[lastIndex] = replaceClusterIPsInHtml(restOfLine + currentLogs[lastIndex]);
                                            }
                                        }
                                        else {
                                            lastIndex = currentLogs.length - 1;
                                            restOfLine = lines.shift();
                                            if (restOfLine) {
                                                currentLogs[lastIndex] = replaceClusterIPsInHtml(currentLogs[lastIndex] + restOfLine);
                                            }
                                        }
                                    }
                                    for (var i = 0; i < lines.length; i++) {
                                        lines[i] = replaceClusterIPsInHtml(lines[i]);
                                    }
                                    if (earlierLog) {
                                        $scope.log.logs = lines.concat(currentLogs);
                                    }
                                    else {
                                        $scope.log.logs = currentLogs.concat(lines);
                                    }
                                }
                                var moveForward = true;
                                if (angular.isDefined(returnedStart)) {
                                    if (returnedStart > $scope.log.start && $scope.log.start === 0) {
                                        // we've jumped to the end of the file to read the tail of it
                                        $scope.log.start = returnedStart;
                                        $scope.log.firstIdx = returnedStart;
                                    }
                                    else if ($scope.log.firstIdx === null) {
                                        // lets remember where the first request started
                                        $scope.log.firstIdx = returnedStart;
                                    }
                                    else if (returnedStart < $scope.log.firstIdx) {
                                        // we've got an earlier bit of the log
                                        // after starting at the tail
                                        // so lets move firstIdx backwards and leave start as it is (at the end of the file)
                                        $scope.log.firstIdx = returnedStart;
                                        moveForward = false;
                                    }
                                }
                                if (moveForward && returnedLength && !earlierLog) {
                                    $scope.log.start += returnedLength;
                                    if (logLength && $scope.log.start > logLength) {
                                        $scope.log.start = logLength;
                                    }
                                }
                                updateJenkinsLink();
                            }
                            $scope.log.fetched = true;
                            Core.$apply($scope);
                            next();
                        }).
                            error(function (data, status, headers, config) {
                            Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                            next();
                        });
                    }
                }
                else {
                    $scope.log.fetched = true;
                    Core.$apply($scope);
                    next();
                }
            });
            if (angular.isFunction($scope.fetch)) {
                $scope.fetch();
            }
            function replaceClusterIpFunction() {
                function createReplaceFunction(from, to) {
                    return function (text) { return replaceText(text, from, to); };
                }
                var replacements = [];
                angular.forEach($scope.model.services, function (service) {
                    var $portalIP = service.$portalIP;
                    var $serviceUrl = service.$serviceUrl;
                    var $portsText = service.$portsText;
                    if ($portalIP && $serviceUrl) {
                        var idx = $serviceUrl.indexOf("://");
                        if (idx > 0) {
                            var replaceWith = $serviceUrl.substring(idx, $serviceUrl.length);
                            if (!replaceWith.endsWith("/")) {
                                replaceWith += "/";
                            }
                            if (replaceWith.length > 4) {
                                replacements.push(createReplaceFunction("://" + $portalIP + "/", replaceWith));
                                if ($portsText) {
                                    var suffix = ":" + $portsText;
                                    var serviceWithPort = replaceWith.substring(0, replaceWith.length - 1);
                                    if (!serviceWithPort.endsWith(suffix)) {
                                        serviceWithPort += suffix;
                                    }
                                    serviceWithPort += "/";
                                    replacements.push(createReplaceFunction("://" + $portalIP + ":" + $portsText + "/", serviceWithPort));
                                }
                            }
                        }
                    }
                });
                function addReplaceFn(from, to) {
                    replacements.push(function (text) {
                        return replaceText(text, from, to);
                    });
                }
                addReplaceFn("[INFO]", "<span class='log-success'>[INFO]</span>");
                addReplaceFn("[WARN]", "<span class='log-warn'>[WARN]</span>");
                addReplaceFn("[WARNING]", "<span class='log-warn'>[WARNING]</span>");
                addReplaceFn("[ERROR]", "<span class='log-error'>[ERROR]</span>");
                addReplaceFn("FAILURE", "<span class='log-error'>FAILURE</span>");
                addReplaceFn("SUCCESS", "<span class='log-success'>SUCCESS</span>");
                // lets try convert the Proceed / Abort links
                replacements.push(function (text) {
                    var prefix = "<a href='#' onclick=\"new Ajax.Request('";
                    var idx = 0;
                    while (idx >= 0) {
                        idx = text.indexOf(prefix, idx);
                        if (idx >= 0) {
                            var start = idx + prefix.length;
                            var endQuote = text.indexOf("'", start + 1);
                            if (endQuote <= 0) {
                                break;
                            }
                            var endDoubleQuote = text.indexOf('"', endQuote + 1);
                            if (endDoubleQuote <= 0) {
                                break;
                            }
                            var url = text.substring(start, endQuote);
                            // TODO using $compile is a tad complex, for now lets cheat with a little onclick ;)
                            //text = text.substring(0, idx) + "<a class='btn btn-default btn-lg' ng-click=\"approve('" + url + "')\"" + text.substring(endDoubleQuote + 1);
                            text = text.substring(0, idx) + "<a class='btn btn-default btn-lg' onclick=\"Developer.clickApprove(this, '" + url + "')\"" + text.substring(endDoubleQuote + 1);
                        }
                    }
                    return text;
                });
                return function (text) {
                    var answer = text;
                    angular.forEach(replacements, function (fn) {
                        answer = fn(answer);
                    });
                    return answer;
                };
            }
            function replaceText(text, from, to) {
                if (from && to && text) {
                    //log.info("Replacing '" + from + "' => '" + to + "'");
                    var idx = 0;
                    while (true) {
                        idx = text.indexOf(from, idx);
                        if (idx >= 0) {
                            text = text.substring(0, idx) + to + text.substring(idx + from.length);
                            idx += to.length;
                        }
                        else {
                            break;
                        }
                    }
                }
                return text;
            }
        }]);
    function clickApprove(element, url) {
        var $scope = angular.element(element).scope();
        if ($scope) {
            $scope.approve(url, element.text);
        }
    }
    Developer.clickApprove = clickApprove;
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.JenkinsMetricsController = Developer.controller("JenkinsMetricsController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.jobId = $routeParams["job"];
            $scope.schema = KubernetesSchema;
            $scope.jenkins = null;
            $scope.entityChangedCache = {};
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.options = {
                chart: {
                    type: 'discreteBarChart',
                    autorefresh: false,
                    height: 450,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 45
                    },
                    clipEdge: true,
                    staggerLabels: false,
                    transitionDuration: 500,
                    stacked: false,
                    interactive: true,
                    tooltip: {
                        enabled: true,
                        contentGenerator: function (args) {
                            var data = args.data || {};
                            return data.tooltip;
                        },
                    },
                    color: function (d, i) {
                        return d.color;
                    },
                    xAxis: {
                        axisLabel: 'Builds',
                        showMaxMin: false,
                        tickFormat: function (d) {
                            return "#" + d;
                        }
                    },
                    yAxis: {
                        axisLabel: 'Build Duration (seconds)',
                        tickFormat: function (d) {
                            return d3.format(',.1f')(d);
                        }
                    }
                }
            };
            $scope.data = [];
            updateData();
            function barColourForBuildResult(result) {
                if (result) {
                    if (result === "FAILURE" || result === "FAILED") {
                        return "red";
                    }
                    else if (result === "ABORTED" || result === "INTERUPTED") {
                        return "tan";
                    }
                    else if (result === "SUCCESS") {
                        return "green";
                    }
                    else if (result === "NOT_STARTED") {
                        return "lightgrey";
                    }
                }
                return "darkgrey";
            }
            function updateChartData() {
                var useSingleSet = true;
                var buildsSucceeded = [];
                var buildsFailed = [];
                var successBuildKey = "Succeeded builds";
                var failedBuildKey = "Failed builds";
                if (useSingleSet) {
                    successBuildKey = "Builds";
                }
                var count = 0;
                var builds = _.sortBy($scope.metrics.builds || [], "number");
                angular.forEach(builds, function (build) {
                    var x = build.number;
                    var y = build.duration / 1000;
                    var date = Developer.asDate(build.timeInMillis);
                    var result = build.result || "NOT_STARTED";
                    var color = barColourForBuildResult(result);
                    var iconClass = Developer.createBuildStatusIconClass(result);
                    var tooltip = '<h3><i class="' + iconClass + '"></i> ' + build.displayName + '</h3>' +
                        '<p>duration: <b>' + y + '</b> seconds</p>';
                    if (date) {
                        tooltip += '<p>started: <b>' + date + '</b></p>';
                    }
                    if (result) {
                        tooltip += '<p>result: <b>' + result + '</b></p>';
                    }
                    if (x) {
                        var data = buildsSucceeded;
                        var key = successBuildKey;
                        if (!successBuildKey && (!result || !result.startsWith("SUCC"))) {
                            data = buildsFailed;
                            key = failedBuildKey;
                        }
                        data.push({
                            tooltip: tooltip,
                            color: color,
                            x: x, y: y });
                    }
                });
                $scope.data = [];
                if (buildsSucceeded.length) {
                    $scope.data.push({
                        key: successBuildKey,
                        values: buildsSucceeded
                    });
                }
                if (buildsFailed.length) {
                    $scope.data.push({
                        key: failedBuildKey,
                        values: buildsFailed
                    });
                }
                $scope.api.updateWithData($scope.data);
                $timeout(function () {
                    $scope.api.update();
                }, 50);
            }
            function updateData() {
                var metricsPath = $scope.jobId ? UrlHelpers.join("job", $scope.jobId, "fabric8/metrics") : "fabric8/metrics";
                var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, metricsPath);
                Developer.log.info("");
                if (url && (!$scope.jenkins || Kubernetes.keepPollingModel)) {
                    $http.get(url, Developer.jenkinsHttpConfig).
                        success(function (data, status, headers, config) {
                        if (data) {
                            if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                                Developer.log.info("entity has changed!");
                                $scope.metrics = data;
                                updateChartData();
                            }
                        }
                        $scope.model.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.NavBarController = Developer.controller("NavBarController", ["$scope", "$location", "$routeParams", "$timeout", "KubernetesApiURL",
        function ($scope, $location, $routeParams, $timeout) {
            $scope.isValid = function (item) {
                if (item) {
                    var value = item.isValid;
                    if (angular.isFunction(value)) {
                        return value(item);
                    }
                    else {
                        return angular.isUndefined(value) || value;
                    }
                    return true;
                }
                return false;
            };
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.PipelineController = Developer.controller("PipelineController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) {
            $scope.kubernetes = KubernetesState;
            $scope.kubeModel = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.jobId = $routeParams["job"];
            $scope.buildId = $routeParams["build"];
            $scope.schema = KubernetesSchema;
            $scope.entityChangedCache = {};
            $scope.model = {
                stages: null
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                if ($scope.jobId) {
                    var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, $scope.buildId, "fabric8/stages/"));
                    if (url && (!$scope.model.stages || Kubernetes.keepPollingModel)) {
                        $http.get(url).
                            success(function (data, status, headers, config) {
                            if (data) {
                                Developer.enrichJenkinsStages(data, $scope.id, $scope.jobId);
                                if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                                    Developer.log.info("entity has changed!");
                                    $scope.build = data;
                                    $scope.model.stages = data.stages;
                                }
                            }
                            $scope.model.fetched = true;
                            Core.$apply($scope);
                        }).
                            error(function (data, status, headers, config) {
                            Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                            $scope.model.fetched = true;
                        });
                    }
                }
                else {
                    $scope.model.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer._module.directive("pipelineView", function () {
        return {
            templateUrl: Developer.templatePath + 'pipelineView.html'
        };
    });
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.PipelinesController = Developer.controller("PipelinesController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) {
            $scope.kubernetes = KubernetesState;
            $scope.kubeModel = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.jobId = $scope.jobId || $routeParams["job"];
            $scope.schema = KubernetesSchema;
            $scope.entityChangedCache = {};
            $scope.model = {
                job: null,
                pendingOnly: $scope.pendingPipelinesOnly
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.$watch('model.pendingOnly', function ($event) {
                updateData();
            });
            updateData();
            $scope.selectBuild = function (build) {
                var id = build.id;
                if (id) {
                    if (id !== $scope.selectedBuildId) {
                        $scope.selectedBuildId = id;
                        $scope.$emit("jenkinsSelectedBuild", build);
                    }
                }
            };
            function updateData() {
                if ($scope.jobId) {
                    var queryPath = "fabric8/stages/";
                    if ($scope.model.pendingOnly) {
                        queryPath = "fabric8/pendingStages/";
                    }
                    var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, queryPath));
                    if (url && (!$scope.model.job || Kubernetes.keepPollingModel)) {
                        $http.get(url).
                            success(function (data, status, headers, config) {
                            if (data) {
                                Developer.enrichJenkinsPipelineJob(data, $scope.id, $scope.jobId);
                                if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                                    Developer.log.info("entity has changed!");
                                    $scope.model.job = data;
                                    var builds = data.builds;
                                    if (builds && builds.length) {
                                        $scope.selectBuild(builds[0]);
                                    }
                                }
                            }
                            $scope.model.fetched = true;
                            Core.$apply($scope);
                        }).
                            error(function (data, status, headers, config) {
                            Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                            $scope.model.fetched = true;
                        });
                    }
                }
                else {
                    $scope.model.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.ProjectController = Developer.controller("ProjectController", ["$scope", "$element", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, $element, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
            $scope.entityChangedCache = {};
            $scope.envVersionsCache = {};
            $scope.envNSCaches = {};
            $scope.envVersions = {};
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            updateTabs();
            // this is used for the pendingPipelines view
            $scope.jobId = $scope.id;
            $scope.pendingPipelinesOnly = true;
            $scope.$on('jenkinsSelectedBuild', function (event, build) {
                $scope.selectedBuild = build;
            });
            // TODO this should be unnecessary but seems sometiems this watch doesn't always trigger unless you hit reload on this page
            if ($scope.model.buildconfigs) {
                onBuildConfigs($scope.model.buildconfigs);
            }
            Kubernetes.watch($scope, $element, "buildconfigs", $scope.namespace, onBuildConfigs);
            function onBuildConfigs(buildConfigs) {
                angular.forEach(buildConfigs, function (data) {
                    var name = Kubernetes.getName(data);
                    if (name === $scope.id) {
                        var sortedBuilds = null;
                        Kubernetes.enrichBuildConfig(data, sortedBuilds);
                        if (Developer.hasObjectChanged(data, $scope.entityChangedCache)) {
                            Developer.log.info("entity has changed!");
                            $scope.entity = data;
                            $scope.entity.$build = (data.$fabric8CodeViews || {})['fabric8.link.browseGogs.view'];
                            $scope.model.setProject($scope.entity);
                        }
                        updateEnvironmentWatch();
                        updateTabs();
                    }
                });
                $scope.model.fetched = true;
                Core.$apply($scope);
            }
            /**
             * We have updated the entity so lets make sure we are watching all the environments to find
             * the project versions for each namespace
             */
            function updateEnvironmentWatch() {
                var project = $scope.entity;
                if (project) {
                    var jenkinsJob = project.$jenkinsJob;
                    if (jenkinsJob) {
                        var buildsTab = _.find($scope.subTabConfig, { id: "builds" });
                        if (buildsTab) {
                            buildsTab["href"] = UrlHelpers.join("/workspaces", Kubernetes.currentKubernetesNamespace(), "projects", $scope.id, "jenkinsJob", jenkinsJob);
                        }
                    }
                    angular.forEach(project.environments, function (env) {
                        var ns = env.namespace;
                        var caches = $scope.envNSCaches[ns];
                        if (!caches) {
                            caches = {};
                            $scope.envNSCaches[ns] = caches;
                            Developer.loadProjectVersions($scope, $element, project, env, ns, $scope.envVersions, caches);
                        }
                    });
                }
            }
            function updateTabs() {
                $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, null, $scope);
            }
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.ProjectsController = Developer.controller("ProjectsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.tableConfig = {
                data: 'model.buildconfigs',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: '$name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    /*
                              {
                                field: 'spec.source.type',
                                displayName: 'Source'
                              },
                    */
                    {
                        field: 'spec.source.git.uri',
                        displayName: 'Repository'
                    },
                    /*
                              {
                                field: 'spec.strategy.type',
                                displayName: 'Strategy'
                              },
                              {
                                field: 'spec.strategy.stiStrategy.image',
                                displayName: 'Source Image'
                              },
                              {
                                field: 'spec.output.imageTag',
                                displayName: 'Output Image'
                              },
                    */
                    {
                        field: 'metadata.description',
                        displayName: 'Description'
                    },
                    {
                        field: '$creationDate',
                        displayName: 'Created',
                        cellTemplate: $templateCache.get("creationTimeTemplate.html")
                    },
                    {
                        field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs();
            $scope.subTabConfig = Developer.createWorkspaceSubNavBars();
            // TODO
            //$scope.isLoggedIntoGogs = Forge.isLoggedIntoGogs;
            $scope.deletePrompt = function (selected) {
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: '$name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    deleteEntity(next, function () {
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                                else {
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Projects',
                    action: 'The following Projects will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            function deleteEntity(selection, nextCallback) {
                var name = (selection || {}).$name;
                var jenkinsJob = selection.$jenkinsJob;
                var publicJenkinsUrl = Developer.jenkinsLink();
                //var jenkinsUrl = Core.pathGet(selection, ["$fabric8Views", "fabric8.link.jenkins.job", "url"]);
                if (name) {
                    console.log("About to delete build config: " + name);
                    var url = Kubernetes.buildConfigRestUrl(name);
                    $http.delete(url).
                        success(function (data, status, headers, config) {
                        nextCallback();
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed to delete build config on " + url + " " + data + " " + status);
                        nextCallback();
                    });
                }
                else {
                    console.log("warning: no name for selection: " + angular.toJson(selection));
                }
                if (jenkinsJob && publicJenkinsUrl) {
                    var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(Developer.jenkinsServiceNameAndPort, UrlHelpers.join("job", jenkinsJob, "doDelete"));
                    var body = "";
                    var config = {
                        headers: {
                            'Content-Type': "text/plain"
                        }
                    };
                    Developer.log.info("posting to jenkinsUrl: " + url);
                    $http.post(url, body, config).
                        success(function (data, status, headers, config) {
                        Developer.log.info("Managed to delete " + url);
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed to delete jenkins job at " + url + " " + data + " " + status);
                    });
                }
            }
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                var url = Kubernetes.buildConfigsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        //console.log("got data " + angular.toJson(data, true));
                        var sortedBuilds = null;
                        $scope.buildConfigs = Kubernetes.enrichBuildConfigs(data.items, sortedBuilds);
                        $scope.model.fetched = true;
                        Core.$apply($scope);
                        next();
                    }
                }).
                    error(function (data, status, headers, config) {
                    Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                    next();
                });
            });
            $scope.fetch();
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.WorkspaceController = Developer.controller("WorkspaceController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["namespace"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.kubernetes_Namespace;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createWorkspaceBreadcrumbs();
            $scope.subTabConfig = Developer.createWorkspaceSubNavBars();
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                $scope.item = null;
                if ($scope.id) {
                    var url = UrlHelpers.join(Kubernetes.resourcesUriForKind("Projects"), $scope.id);
                    Developer.log.info("Loading url: " + url);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.entity = Developer.enrichWorkspace(data);
                        }
                        $scope.model.fetched = true;
                        Core.$apply($scope);
                        next();
                    }).
                        error(function (data, status, headers, config) {
                        Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                        next();
                    });
                }
                else {
                    $scope.model.fetched = true;
                    Core.$apply($scope);
                    next();
                }
            });
            $scope.fetch();
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>
var Developer;
(function (Developer) {
    Developer.WorkspacesController = Developer.controller("WorkspacesController", ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesServices, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');
            $scope.developerPerspective = Core.trimLeading($location.url(), "/").startsWith("workspace");
            $scope.tableConfig = {
                data: 'model.workspaces',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: '$name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get($scope.developerPerspective ? "viewNamespaceProjectsTemplate.html" : "viewNamespaceTemplate.html")
                    },
                    {
                        field: 'metadata.description',
                        displayName: 'Description'
                    },
                    {
                        field: '$creationDate',
                        displayName: 'Created',
                        cellTemplate: $templateCache.get("creationTimeTemplate.html")
                    },
                    {
                        field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createWorkspacesBreadcrumbs($scope.developerPerspective);
            $scope.subTabConfig = Developer.createWorkspacesSubNavBars($scope.developerPerspective);
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                var url = Kubernetes.resourcesUriForKind("Projects");
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        $scope.model.workspaces = _.sortBy(Developer.enrichWorkspaces(data.items), "$name");
                        $scope.model.fetched = true;
                    }
                    Core.$apply($scope);
                    next();
                }).
                    error(function (data, status, headers, config) {
                    Developer.log.warn("Failed to load " + url + " " + data + " " + status);
                    Core.$apply($scope);
                    next();
                });
            });
            $scope.fetch();
        }]);
})(Developer || (Developer = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module = angular.module(Kubernetes.pluginName, ['hawtio-core', 'hawtio-ui', 'ui.codemirror', 'ui.validate', 'kubernetesUI']);
    Kubernetes.controller = PluginHelpers.createControllerFunction(Kubernetes._module, Kubernetes.pluginName);
    Kubernetes.route = PluginHelpers.createRoutingFunction(Kubernetes.templatePath);
    Kubernetes._module.config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when(UrlHelpers.join(Kubernetes.context, '/pods'), Kubernetes.route('pods.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'replicationControllers'), Kubernetes.route('replicationControllers.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'services'), Kubernetes.route('services.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'events'), Kubernetes.route('events.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'apps'), Kubernetes.route('apps.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'apps/:namespace'), Kubernetes.route('apps.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'templates'), Kubernetes.route('templates.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'hosts'), Kubernetes.route('hosts.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'hosts/:id'), Kubernetes.route('host.html', true))
                .when(UrlHelpers.join(Kubernetes.context, 'pipelines'), Kubernetes.route('pipelines.html', false))
                .when(UrlHelpers.join(Kubernetes.context, 'overview'), Kubernetes.route('overview.html', true))
                .when(Kubernetes.context, { redirectTo: "/workspaces" });
            angular.forEach([Kubernetes.context, "/workspaces/:workspace/projects/:project"], function (context) {
                $routeProvider
                    .when(UrlHelpers.join(context, '/namespace/:namespace/podCreate'), Kubernetes.route('podCreate.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/podEdit/:id'), Kubernetes.route('podEdit.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/pods'), Kubernetes.route('pods.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/pods/:id'), Kubernetes.route('pod.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers'), Kubernetes.route('replicationControllers.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers/:id'), Kubernetes.route('replicationController.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerCreate'), Kubernetes.route('replicationControllerCreate.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerEdit/:id'), Kubernetes.route('replicationControllerEdit.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/secrets'), Kubernetes.route('secrets.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/secrets/:id'), Kubernetes.route('secret.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/secretCreate'), Kubernetes.route('secret.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/services'), Kubernetes.route('services.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/services/:id'), Kubernetes.route('service.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/serviceCreate'), Kubernetes.route('serviceCreate.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/serviceEdit/:id'), Kubernetes.route('serviceEdit.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/events'), Kubernetes.route('events.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/apps'), Kubernetes.route('apps.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/overview'), Kubernetes.route('overview.html', true))
                    .when(UrlHelpers.join(context, '/namespace/:namespace/templates/:targetNamespace'), Kubernetes.route('templates.html', false))
                    .when(UrlHelpers.join(context, '/namespace/:namespace'), Kubernetes.route('apps.html', false))
                    .when(UrlHelpers.join(context, 'builds'), Kubernetes.route('builds.html', false))
                    .when(UrlHelpers.join(context, 'builds/:id'), Kubernetes.route('build.html', true))
                    .when(UrlHelpers.join(context, 'buildLogs/:id'), Kubernetes.route('buildLogs.html', true))
                    .when(UrlHelpers.join(context, 'buildConfigs'), Kubernetes.route('buildConfigs.html', false))
                    .when(UrlHelpers.join(context, 'buildConfigs/:id'), Kubernetes.route('buildConfig.html', true))
                    .when(UrlHelpers.join(context, 'buildConfigEdit/:id'), Kubernetes.route('buildConfigEdit.html', true))
                    .when(UrlHelpers.join(context, 'buildConfigCreate'), Kubernetes.route('buildConfigCreate.html', true))
                    .when(UrlHelpers.join(context, 'deploymentConfigs'), Kubernetes.route('deploymentConfigs.html', false))
                    .when(UrlHelpers.join(context, 'deploymentConfigs/:id'), Kubernetes.route('deploymentConfig.html', true))
                    .when(UrlHelpers.join(context, 'imageRepositories'), Kubernetes.route('imageRepositories.html', false));
            });
            angular.forEach([Kubernetes.context, "/workspaces/:workspace", "/workspaces/:workspace/projects/:project"], function (context) {
                $routeProvider
                    .when(UrlHelpers.join(context, 'buildConfigEdit'), Kubernetes.route('buildConfigEdit.html', true))
                    .when(UrlHelpers.join(context, 'buildConfigEdit/:id'), Kubernetes.route('buildConfigEdit.html', true));
            });
        }]);
    Kubernetes._module.factory('AppLibraryURL', ['$rootScope', function ($rootScope) {
            return UrlHelpers.join(Kubernetes.kubernetesApiUrl(), "/proxy", Kubernetes.kubernetesNamespacePath(), "/services/app-library");
        }]);
    Kubernetes._module.factory('WikiGitUrlPrefix', function () {
        return UrlHelpers.join(Kubernetes.kubernetesApiUrl(), "/proxy", Kubernetes.kubernetesNamespacePath(), "services/app-library");
    });
    Kubernetes._module.factory('wikiRepository', ["$location", "localStorage", function ($location, localStorage) {
            return false;
        }]);
    Kubernetes._module.factory('ConnectDialogService', ['$rootScope', function ($rootScope) {
            return {
                dialog: new UI.Dialog(),
                saveCredentials: false,
                userName: null,
                password: null,
                jolokiaUrl: null,
                containerName: null,
                view: null
            };
        }]);
    Kubernetes._module.filter('kubernetesPageLink', function () { return Kubernetes.entityPageLink; });
    Kubernetes._module.run(['viewRegistry', 'ServiceRegistry', 'HawtioNav', 'KubernetesModel', '$templateCache', function (viewRegistry, ServiceRegistry, HawtioNav, KubernetesModel, $templateCache) {
            Kubernetes.log.debug("Running");
            viewRegistry['kubernetes'] = Kubernetes.templatePath + 'layoutKubernetes.html';
            var builder = HawtioNav.builder();
            var apps = builder.id('kube-apps')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'apps'); })
                .title(function () { return 'Apps'; })
                .build();
            var services = builder.id('kube-services')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'services'); })
                .title(function () { return 'Services'; })
                .build();
            var controllers = builder.id('kube-controllers')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'replicationControllers'); })
                .title(function () { return 'Controllers'; })
                .build();
            var pods = builder.id('kube-pods')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'pods'); })
                .title(function () { return 'Pods'; })
                .build();
            var events = builder.id('kube-events')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'events'); })
                .title(function () { return 'Events'; })
                .build();
            var hosts = builder.id('kube-hosts')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'hosts'); })
                .title(function () { return 'Hosts'; })
                .build();
            var overview = builder.id('kube-overview')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'overview'); })
                .title(function () { return 'Diagram'; })
                .build();
            var builds = builder.id('kube-builds')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'builds'); })
                .title(function () { return 'Builds'; })
                .build();
            var buildConfigs = builder.id('kube-buildConfigs')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'buildConfigs'); })
                .title(function () { return 'Build Configs'; })
                .build();
            var deploys = builder.id('kube-deploys')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'deploymentConfigs'); })
                .title(function () { return 'Deploys'; })
                .build();
            var imageRepositories = builder.id('kube-imageRepositories')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'imageRepositories'); })
                .title(function () { return 'Registries'; })
                .build();
            var pipelines = builder.id('kube-pipelines')
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'pipelines'); })
                .title(function () { return 'Pipelines'; })
                .build();
            var repos = builder.id('kube-repos')
                .href(function () { return "/forge/repos"; })
                .isValid(function () { return ServiceRegistry.hasService(Kubernetes.fabric8ForgeServiceName) && ServiceRegistry.hasService(Kubernetes.gogsServiceName); })
                .title(function () { return 'Repositories'; })
                .build();
            var mainTab = builder.id('kubernetes')
                .rank(200)
                .defaultPage({
                rank: 20,
                isValid: function (yes, no) {
                    yes();
                }
            })
                .href(function () { return Kubernetes.context; })
                .title(function () { return 'Kubernetes'; })
                .tabs(apps, services, controllers, pods, events, hosts, overview)
                .build();
            HawtioNav.add(mainTab);
            /*
            HawtioNav.add({
              id: 'k8sAppSwitcher',
              title: () => '', // not used as 'template' below overrides this
              isValid: () => KubernetesModel.serviceApps.length > 0,
              context: true,
              template: () => $templateCache.get(UrlHelpers.join(templatePath, 'serviceApps.html'))
            });
            */
            var projectsTab = builder.id('openshift')
                .rank(100)
                .href(function () { return UrlHelpers.join(Kubernetes.context, 'buildConfigs') + '?sub-tab=kube-buildConfigs'; })
                .title(function () { return 'Projects'; })
                .tabs(repos, buildConfigs, builds, deploys, imageRepositories)
                .build();
            HawtioNav.add(projectsTab);
        }]);
    hawtioPluginLoader.registerPreBootstrapTask({
        name: 'KubernetesInit',
        task: function (next) {
            $.getScript('osconsole/config.js')
                .done(function (script, textStatus) {
                var config = Kubernetes.osConfig = window['OPENSHIFT_CONFIG'];
                Kubernetes.log.debug("Fetched OAuth config: ", config);
                var master = config.master_uri;
                if (!master && config.api && config.api.k8s) {
                    var masterUri = new URI().host(config.api.k8s.hostPort).path("").query("");
                    if (config.api.k8s.proto) {
                        masterUri.protocol(config.api.k8s.proto);
                    }
                    master = masterUri.toString();
                }
                OSOAuthConfig = config.openshift;
                GoogleOAuthConfig = config.google;
                KeycloakConfig = config.keycloak;
                if (OSOAuthConfig && !master) {
                    // TODO auth.master_uri no longer used right?
                    // master = OSOAuthConfig.master_uri;
                    if (!master) {
                        var oauth_authorize_uri = OSOAuthConfig.oauth_authorize_uri;
                        if (oauth_authorize_uri) {
                            var text = oauth_authorize_uri;
                            var idx = text.indexOf("://");
                            if (idx > 0) {
                                idx += 3;
                                idx = text.indexOf("/", idx);
                                if (idx > 0) {
                                    master = text.substring(0, ++idx);
                                }
                            }
                        }
                    }
                }
                if ((!Kubernetes.masterUrl || Kubernetes.masterUrl === "/") && (!master || master === "/")) {
                    // lets default the master to the current protocol and host/port
                    // in case the master url is "/" and we are
                    // serving up static content from inside /api/v1/namespaces/default/services/fabric8 or something like that
                    var href = location.href;
                    if (href) {
                        master = new URI(href).query("").path("").toString();
                    }
                }
                if (master) {
                    Kubernetes.masterUrl = master;
                    next();
                    return;
                }
            })
                .fail(function (response) {
                Kubernetes.log.debug("Error fetching OAUTH config: ", response);
            })
                .always(function () {
                next();
            });
        }
    }, true);
    hawtioPluginLoader.addModule('ngResource');
    hawtioPluginLoader.addModule(Kubernetes.pluginName);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.Apps = Kubernetes.controller("Apps", ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "KubernetesApiURL", "$templateCache", "$location", "$routeParams", "$http", "$dialog", "$timeout",
        function ($scope, KubernetesModel, KubernetesServices, KubernetesReplicationControllers, KubernetesPods, KubernetesState, KubernetesApiURL, $templateCache, $location, $routeParams, $http, $dialog, $timeout) {
            $scope.model = KubernetesModel;
            $scope.apps = [];
            $scope.allApps = [];
            $scope.kubernetes = KubernetesState;
            $scope.fetched = false;
            $scope.json = '';
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'appSelectorShow', 'openApp', undefined);
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'detail');
            var branch = $scope.branch || "master";
            var namespace = null;
            function appMatches(app) {
                var filterText = $scope.appSelector.filterText;
                if (filterText) {
                    return Core.matchFilterIgnoreCase(app.groupId, filterText) ||
                        Core.matchFilterIgnoreCase(app.artifactId, filterText) ||
                        Core.matchFilterIgnoreCase(app.name, filterText) ||
                        Core.matchFilterIgnoreCase(app.description, filterText);
                }
                else {
                    return true;
                }
            }
            function appRunning(app) {
                return $scope.model.apps.any(function (running) { return running.appPath === app.appPath; });
            }
            $scope.tableConfig = {
                data: 'model.apps',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    { field: '$name', displayName: 'App', cellTemplate: $templateCache.get("appIconTemplate.html") },
                    { field: '$servicesText', displayName: 'Services', cellTemplate: $templateCache.get("appServicesTemplate.html") },
                    { field: '$replicationControllersText', displayName: 'Controllers', cellTemplate: $templateCache.get("appReplicationControllerTemplate.html") },
                    { field: '$podCount', displayName: 'Pods', cellTemplate: $templateCache.get("appPodCountsAndLinkTemplate.html") },
                    { field: '$creationDate', displayName: 'Deployed', cellTemplate: $templateCache.get("appDeployedTemplate.html") }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.expandedPods = [];
            $scope.$on('do-resize', function ($event, controller) {
                $scope.resizeDialog.open(controller);
            });
            $scope.podExpanded = function (pod) {
                var id = Kubernetes.getName(pod);
                return id && ($scope.expandedPods || []).indexOf(id) >= 0;
            };
            $scope.expandPod = function (pod) {
                var id = Kubernetes.getName(pod);
                if (id) {
                    $scope.expandedPods.push(id);
                }
            };
            $scope.collapsePod = function (pod) {
                var id = Kubernetes.getName(pod);
                if (id) {
                    $scope.expandedPods = $scope.expandedPods.remove(function (v) { return id === v; });
                }
            };
            $scope.$on('$routeUpdate', function ($event) {
                Kubernetes.setJson($scope, $location.search()['_id'], $scope.model.apps);
            });
            function deleteApp(app, onCompleteFn) {
                function deleteServices(services, service, onCompletedFn) {
                    if (!service || !services) {
                        return onCompletedFn();
                    }
                    var id = Kubernetes.getName(service);
                    if (!id) {
                        Kubernetes.log.warn("No ID for service " + angular.toJson(service));
                    }
                    else {
                        KubernetesServices.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted service: ", id);
                            deleteServices(services, services.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting service: ", error);
                            deleteServices(services, services.shift(), onCompletedFn);
                        });
                    }
                }
                function deleteReplicationControllers(replicationControllers, replicationController, onCompletedFn) {
                    if (!replicationController || !replicationControllers) {
                        return onCompletedFn();
                    }
                    var id = Kubernetes.getName(replicationController);
                    if (!id) {
                        Kubernetes.log.warn("No ID for replicationController " + angular.toJson(replicationController));
                    }
                    else {
                        KubernetesReplicationControllers.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted replicationController: ", id);
                            deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting replicationController: ", error);
                            deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
                        });
                    }
                }
                function deletePods(pods, pod, onCompletedFn) {
                    if (!pod || !pods) {
                        return onCompletedFn();
                    }
                    var id = Kubernetes.getName(pod);
                    if (!id) {
                        Kubernetes.log.warn("No ID for pod " + angular.toJson(pod));
                    }
                    else {
                        KubernetesPods.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted pod: ", id);
                            deletePods(pods, pods.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting pod: ", error);
                            deletePods(pods, pods.shift(), onCompletedFn);
                        });
                    }
                }
                var services = [].concat(app.services);
                deleteServices(services, services.shift(), function () {
                    var replicationControllers = [].concat(app.replicationControllers);
                    deleteReplicationControllers(replicationControllers, replicationControllers.shift(), function () {
                        var pods = [].concat(app.pods);
                        deletePods(pods, pods.shift(), onCompleteFn);
                    });
                });
            }
            $scope.deleteSingleApp = function (app) {
                $scope.deletePrompt([app]);
            };
            $scope.deletePrompt = function (selected) {
                if (angular.isString(selected)) {
                    selected = [{
                            id: selected
                        }];
                }
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: '$name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    var id = next.name;
                                    Kubernetes.log.debug("deleting: ", id);
                                    deleteApp(next, function () {
                                        Kubernetes.log.debug("deleted: ", id);
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Apps?',
                    action: 'The following Apps will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            $scope.appSelector = {
                filterText: "",
                folders: [],
                selectedApps: [],
                isOpen: function (folder) {
                    if ($scope.appSelector.filterText !== '' || folder.expanded) {
                        return "opened";
                    }
                    return "closed";
                },
                getSelectedClass: function (app) {
                    if (app.abstract) {
                        return "abstract";
                    }
                    if (app.selected) {
                        return "selected";
                    }
                    return "";
                },
                showApp: function (app) {
                    return appMatches(app) && !appRunning(app);
                },
                showFolder: function (folder) {
                    return !$scope.appSelector.filterText || folder.apps.some(function (app) { return appMatches(app) && !appRunning(app); });
                },
                clearSelected: function () {
                    angular.forEach($scope.model.appFolders, function (folder) {
                        angular.forEach(folder.apps, function (app) {
                            app.selected = false;
                        });
                    });
                    $scope.appSelector.selectedApps = [];
                    Core.$apply($scope);
                },
                updateSelected: function () {
                    // lets update the selected apps
                    var selectedApps = [];
                    angular.forEach($scope.model.appFolders, function (folder) {
                        var apps = folder.apps.filter(function (app) { return app.selected; });
                        if (apps) {
                            selectedApps = selectedApps.concat(apps);
                        }
                    });
                    $scope.appSelector.selectedApps = selectedApps.sortBy("name");
                },
                select: function (app, flag) {
                    app.selected = flag;
                    $scope.appSelector.updateSelected();
                },
                hasSelection: function () {
                    return $scope.model.appFolders.any(function (folder) { return folder.apps.any(function (app) { return app.selected; }); });
                },
                runSelectedApps: function () {
                    // lets run all the selected apps
                    angular.forEach($scope.appSelector.selectedApps, function (app) {
                        var name = app.name;
                        var metadataPath = app.metadataPath;
                        if (metadataPath) {
                            // lets load the json/yaml
                            //var url = gitPathToUrl(Wiki.gitRelativeURL(branch, metadataPath));
                            var url = Kubernetes.gitPathToUrl(metadataPath, branch);
                            if (url) {
                                $http.get(url).
                                    success(function (data, status, headers, config) {
                                    if (data) {
                                        // lets convert the json object structure into a string
                                        var json = angular.toJson(data);
                                        var fn = function () { };
                                        Kubernetes.runApp($location, $scope, $http, KubernetesApiURL, json, name, fn, namespace);
                                    }
                                }).
                                    error(function (data, status, headers, config) {
                                    $scope.summaryHtml = null;
                                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                                });
                            }
                        }
                    });
                    // lets go back to the apps view
                    $scope.appSelector.clearSelected();
                    $scope.appSelectorShow = false;
                }
            };
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module.directive("hawtioBreadcrumbs", function () {
        return {
            templateUrl: Kubernetes.templatePath + 'breadcrumbs.html'
        };
    });
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildController = Kubernetes.controller("BuildController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.os_build_Build;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, null, $scope);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                $scope.item = null;
                if ($scope.id) {
                    var url = Kubernetes.buildRestUrl($scope.id);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.entity = Kubernetes.enrichBuild(data);
                        }
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
                else {
                    $scope.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildConfigController = Kubernetes.controller("BuildConfigController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                $scope.item = null;
                if ($scope.id) {
                    var url = Kubernetes.buildConfigRestUrl($scope.id);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.entity = data;
                            var sortedBuilds = null;
                            Kubernetes.enrichBuildConfig(data, sortedBuilds);
                            $scope.model.setProject($scope.entity);
                        }
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
                else {
                    $scope.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildConfigEditController = Kubernetes._module.controller("Kubernetes.BuildConfigEditController", ["$scope", "$element", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "K8SClientFactory", "SchemaRegistry", function ($scope, $element, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory, SchemaRegistry) {
        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["project"] || $routeParams["id"];
        $scope.schema = KubernetesSchema;
        var specConfig = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildConfigSpec');
        var gitBuildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.GitBuildSource');
        var buildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildSource');
        var buildOutput = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildOutput');
        var resources = SchemaRegistry.getSchema('io.fabric8.kubernetes.api.model.ResourceRequirements');
        var revision = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.SourceRevision');
        var strategy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildStrategy');
        var customStrategy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.CustomBuildStrategy');
        var buildTriggerPolicy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildTriggerPolicy');
        var getSecrets = function () {
            return $scope.secrets;
        };
        var secretSchemaType = "fabric8_SecretReference";
        var secretSchemaRef = "#/definitions/" + secretSchemaType;
        var secretSchemaJavaType = "io.fabric8.console.SecretReference";
        var secretNameElement = {
            "type": "string",
            "enum": getSecrets
        };
        var secretSchema = {
            "type": "object",
            properties: {
                "name": secretNameElement
            },
            javaType: secretSchemaJavaType
        };
        SchemaRegistry.addSchema(secretSchemaType, secretSchema);
        // lets switch to the new secrets types:
        angular.forEach([
            Core.pathGet(customStrategy, ["properties", "pullSecret"]),
            Core.pathGet(buildSource, ["properties", "sourceSecret"]),
        ], function (schemaType) {
            if (schemaType) {
                schemaType["type"] = secretSchemaType;
                schemaType["$ref"] = secretSchemaRef;
                schemaType["javaType"] = secretSchemaJavaType;
            }
        });
        $scope.customStrategy = customStrategy;
        $scope.buildSource = buildSource;
        $scope.secrets = [];
        // $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
        //$scope.specConfig = KubernetesSchema.definitions.os_build_BuildConfigSpec;
        //
        specConfig.style = HawtioForms.FormStyle.STANDARD;
        specConfig.properties['triggers']['label-attributes'] = {
            style: 'display: none;'
        };
        gitBuildSource.controls = ['uri', 'ref', '*'];
        buildSource.properties['type'].type = 'hidden';
        buildSource.properties['type']['default'] = 'Git';
        buildSource.controls = ['git', 'contextDir', 'sourceSecret', '*'];
        gitBuildSource['hideLegend'] = true;
        buildSource['hideLegend'] = true;
        buildOutput['hideLegend'] = true;
        resources['hideLegend'] = true;
        revision['hideLegend'] = true;
        strategy['hideLegend'] = true;
        strategy.controls = ['type', '*'];
        strategy.properties['type'] = {
            type: 'text',
            enum: [{
                    'value': 'Custom',
                    'label': 'Custom'
                }, {
                    'value': 'Docker',
                    'label': 'Docker'
                }, {
                    'value': 'Source',
                    'label': 'Source'
                }]
        };
        customStrategy['control-group-attributes'] = {
            'ng-show': "entity.type == 'Custom'"
        };
        strategy.properties['dockerStrategy']['control-group-attributes'] = {
            'ng-show': "entity.type == 'Docker'"
        };
        strategy.properties['sourceStrategy']['control-group-attributes'] = {
            'ng-show': "entity.type == 'Source'"
        };
        buildTriggerPolicy.controls = ['type', '*'];
        buildTriggerPolicy.properties['type'] = {
            type: 'string',
            enum: [{
                    'value': 'Github',
                    'label': 'Github'
                }, {
                    'value': 'ImageChange',
                    'label': 'Image Change'
                }, {
                    'value': 'Generic',
                    'label': 'Generic'
                }]
        };
        buildTriggerPolicy.properties['generic']['control-group-attributes'] = {
            'ng-show': "entity.type == 'Generic'"
        };
        buildTriggerPolicy.properties['github']['control-group-attributes'] = {
            'ng-show': "entity.type == 'Github'"
        };
        buildTriggerPolicy.properties['imageChange']['control-group-attributes'] = {
            'ng-show': "entity.type == 'ImageChange'"
        };
        // re-arranging the controls
        //specConfig.controls = ['source', '*'];
        // tabs
        specConfig.tabs = {
            "Source": ["source"],
            "Revision": ["revision"],
            "Output": ["output"],
            "Resources": ["resources"],
            "Strategy": ["strategy"],
            "Triggers": ["triggers"],
            "Service Account": ["serviceAccount"]
        };
        /*
         * wizard, needs an 'onFinish' function in the scope
        specConfig.wizard = <any>{
          pages: {
            Source: {
              controls: ["source"]
            },
            Revision: {
              controls: ["revision"]
            },
            Output: {
              controls: ["output"]
            },
            Resources: {
              controls: ["resources"]
            },
            Strategy: {
              controls: ["strategy"]
            },
            Triggers: {
              controls: ["triggers"]
            },
            "Service Account": {
              controls: ["serviceAccount"]
            }
          }
        };
        */
        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectSettingsBreadcrumbs($scope.projectId);
        $scope.subTabConfig = Developer.createProjectSettingsSubNavBars($scope.projectId);
        Kubernetes.watch($scope, $element, "secrets", $scope.namespace, onSecrets);
        $scope.buildConfigClient = K8SClientFactory.create("buildconfigs", $scope.namespace);
        $element.on('$destroy', function () {
            $scope.$destroy();
        });
        $scope.$on('$destroy', function () {
            K8SClientFactory.destroy($scope.buildConfigClient);
        });
        /*
                $scope.$on('kubernetesModelUpdated', function () {
                  updateData();
                });
        
        */
        $scope.$on('$routeUpdate', function ($event) {
            updateData();
        });
        $scope.save = function () {
            Kubernetes.log.info("Saving!");
            var entity = $scope.entity;
            var spec = (entity || {}).spec || {};
            // TODO update the jenkins job name!
            // lets delete lots of cruft
            var strategy = spec.strategy || {};
            delete strategy["dockerStrategy"];
            delete strategy["sourceStrategy"];
            delete spec["revision"];
            delete spec["output"];
            delete spec["resources"];
            var strategyPullSecretName = Core.pathGet(spec, ["strategy", "customStrategy", "pullSecret", "name"]);
            var sourceSecretName = Core.pathGet(spec, ["source", "sourceSecret", "name"]);
            Kubernetes.log.info("sourceSecretName: " + sourceSecretName);
            Kubernetes.log.info("strategyPullSecretName: " + strategyPullSecretName);
            if (!strategyPullSecretName && sourceSecretName) {
                Core.pathSet(spec, ["strategy", "customStrategy", "pullSecret", "name"], sourceSecretName);
            }
            /*
                      // TODO hack until the put deals with updates
                      var metadata = entity.metadata;
                      if (metadata) {
                        delete metadata["resourceVersion"];
                      }
            */
            Kubernetes.log.info(angular.toJson(entity, true));
            $scope.buildConfigClient.put(entity, function (obj) {
                Kubernetes.log.info("build config created!");
                var link = Developer.editPipelineLink($scope.namespace, Kubernetes.getName(entity));
                if (link) {
                    Kubernetes.log.info("Navigating to: " + link);
                    $location.path(link);
                }
                else {
                    Kubernetes.log.warn("Could not find the edit pipeline link!");
                }
            });
        };
        updateData();
        var jenkinsUrl = Developer.jenkinsLink();
        var jobName = "";
        function updateData() {
            $scope.item = null;
            if ($scope.id) {
                var url = Kubernetes.buildConfigRestUrl($scope.id);
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        $scope.entity = data;
                        var buildConfig = angular.copy(data);
                        var sortedBuilds = null;
                        Kubernetes.enrichBuildConfig(buildConfig, sortedBuilds);
                        $scope.buildConfig = buildConfig;
                    }
                    $scope.spec = ($scope.entity || {}).spec || {};
                    $scope.fetched = true;
                    // lets update the tabs
                    $scope.subTabConfig = Developer.createProjectSubNavBars($scope.projectId, null, $scope);
                    Core.$apply($scope);
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
            else {
                $scope.fetched = true;
                $scope.entity = {
                    "apiVersion": "v1",
                    "kind": "BuildConfig",
                    "metadata": {
                        "name": "",
                        "labels": {}
                    },
                    "spec": {
                        "source": {
                            "type": "Git"
                        },
                        "strategy": {
                            "type": "Custom",
                            "customStrategy": {
                                "from": {
                                    "kind": "DockerImage",
                                    "name": "fabric8/openshift-s2i-jenkins-trigger"
                                },
                                "env": [
                                    {
                                        "name": "BASE_URI",
                                        "value": jenkinsUrl
                                    },
                                    {
                                        "name": "JOB_NAME",
                                        "value": jobName
                                    }
                                ]
                            }
                        }
                    }
                };
                $scope.spec = $scope.entity.spec;
                Core.$apply($scope);
            }
        }
        function onSecrets(secrets) {
            var array = [];
            angular.forEach(secrets, function (secret) {
                var name = Kubernetes.getName(secret);
                if (name) {
                    array.push({
                        label: name,
                        value: name,
                        "attributes": {
                            "title": name
                        },
                        $secret: secret
                    });
                }
            });
            $scope.secrets = _.sortBy(array, "label");
        }
        $scope.specConfig = specConfig;
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildConfigsController = Kubernetes.controller("BuildConfigsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.tableConfig = {
                data: 'model.buildconfigs',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'metadata.name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("buildConfigLinkTemplate.html")
                    },
                    /*
                              {
                                field: 'spec.source.type',
                                displayName: 'Source'
                              },
                    */
                    {
                        field: 'spec.source.git.uri',
                        displayName: 'Repository'
                    },
                    /*
                              {
                                field: 'spec.strategy.type',
                                displayName: 'Strategy'
                              },
                              {
                                field: 'spec.strategy.stiStrategy.image',
                                displayName: 'Source Image'
                              },
                              {
                                field: 'spec.output.imageTag',
                                displayName: 'Output Image'
                              },
                    */
                    {
                        field: '$fabric8CodeViews',
                        displayName: 'Code',
                        width: "***",
                        minWidth: 500,
                        cellTemplate: $templateCache.get("buildConfigCodeViewsTemplate.html")
                    },
                    {
                        field: '$fabric8BuildViews',
                        displayName: 'Builds',
                        width: "***",
                        minWidth: 500,
                        cellTemplate: $templateCache.get("buildConfigBuildViewsTemplate.html")
                    },
                    {
                        field: '$fabric8EnvironmentViews',
                        displayName: 'Environments',
                        width: "***",
                        minWidth: 500,
                        cellTemplate: $templateCache.get("buildConfigEnvironmentViewsTemplate.html")
                    },
                    {
                        field: '$fabric8TeamViews',
                        displayName: 'People',
                        width: "***",
                        minWidth: 500,
                        cellTemplate: $templateCache.get("buildConfigTeamViewsTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            // TODO
            // $scope.isLoggedIntoGogs = Forge.isLoggedIntoGogs;
            $scope.deletePrompt = function (selected) {
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: '$name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    deleteEntity(next, function () {
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                                else {
                                    updateData();
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Build Configs?',
                    action: 'The following Build Configs will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            function deleteEntity(selection, nextCallback) {
                var name = (selection || {}).$name;
                if (name) {
                    console.log("About to delete build config: " + name);
                    var url = Kubernetes.buildConfigRestUrl(name);
                    $http.delete(url).
                        success(function (data, status, headers, config) {
                        nextCallback();
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to delete build config on " + url + " " + data + " " + status);
                    });
                }
                else {
                    console.log("warning: no name for selection: " + angular.toJson(selection));
                }
            }
            function updateData() {
                /*
                        var url = buildConfigsRestURL();
                        $http.get(url).
                          success(function (data, status, headers, config) {
                            if (data) {
                              //console.log("got data " + angular.toJson(data, true));
                              var sortedBuilds = null;
                              $scope.buildConfigs = enrichBuildConfigs(data.items, sortedBuilds);
                              $scope.fetched = true;
                              Core.$apply($scope);
                            }
                          }).
                          error(function (data, status, headers, config) {
                            log.warn("Failed to load " + url + " " + data + " " + status);
                          });
                */
            }
            updateData();
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildLogsController = Kubernetes.controller("BuildLogsController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.os_build_Build;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.logsText = "Loading logs...";
            updateData();
            function updateData() {
                $scope.item = null;
                if ($scope.id) {
                    var url = Kubernetes.buildRestUrl($scope.id);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.entity = Kubernetes.enrichBuild(data);
                        }
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                    url = Kubernetes.buildLogsRestUrl($scope.id);
                    $http.get(url).
                        success(function (data, status) {
                        $scope.logsText = data;
                        Core.$apply($scope);
                    }).
                        error(function (data, status) {
                        $scope.logsText = "Failed to load logs from: " + url + " " + data + " status: " + status;
                        Core.$apply($scope);
                    }).
                        catch(function (error) {
                        $scope.logsText = "Failed to load logs: " + angular.toJson(error, true);
                        Core.$apply($scope);
                    });
                }
                else {
                    $scope.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.BuildsController = Kubernetes.controller("BuildsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.buildConfigId = $routeParams["id"];
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.tableConfig = {
                data: 'builds',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'metadata.name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("buildLinkTemplate.html")
                    },
                    {
                        field: '$creationDate',
                        displayName: 'Time',
                        defaultSort: true,
                        cellTemplate: $templateCache.get("buildTimeTemplate.html")
                    },
                    {
                        field: 'status',
                        displayName: 'Status',
                        cellTemplate: $templateCache.get("buildStatusTemplate.html")
                    },
                    {
                        field: '$logsLink',
                        displayName: 'Logs',
                        cellTemplate: $templateCache.get("buildLogsTemplate.html")
                    },
                    {
                        field: '$podLink',
                        displayName: 'Build Pod',
                        cellTemplate: $templateCache.get("buildPodTemplate.html")
                    },
                    /*
                              {
                                field: 'parameters.source.type',
                                displayName: 'Source'
                              },
                    */
                    {
                        field: 'parameters.source.git.uri',
                        displayName: 'Repository',
                        cellTemplate: $templateCache.get("buildRepositoryTemplate.html")
                    },
                    {
                        field: 'parameters.strategy.type',
                        displayName: 'Strategy'
                    },
                    {
                        field: 'parameters.strategy.stiStrategy.image',
                        displayName: 'Source Image'
                    },
                    {
                        field: 'parameters.output.imageTag',
                        displayName: 'Output Image'
                    }]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.buildConfigId);
            $scope.subTabConfig = Developer.createProjectSubNavBars($scope.buildConfigId, null, $scope);
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                var url = Kubernetes.buildsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        //console.log("got data " + angular.toJson(data, true));
                        $scope.builds = Kubernetes.enrichBuilds(data.items);
                        $scope.fetched = true;
                        if ($scope.model) {
                            $scope.buildConfig = $scope.model.getBuildConfig($scope.buildConfigId);
                        }
                    }
                    Core.$apply($scope);
                    next();
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    Core.$apply($scope);
                    next();
                });
            });
            $scope.fetch();
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    // controller for connecting to a remote container via jolokia
    Kubernetes.ConnectController = Kubernetes.controller("ConnectController", [
        "$scope", "localStorage", "userDetails", "ConnectDialogService", "$browser",
        function ($scope, localStorage, userDetails, ConnectDialogService, $browser) {
            $scope.doConnect = function (entity) {
                var connectUrl = new URI().path(UrlHelpers.join(HawtioCore.documentBase(), '/java/index.html'));
                var returnTo = new URI().toString();
                var title = entity.metadata.name || 'Untitled Container';
                var token = userDetails.token || '';
                connectUrl.hash(token).query({
                    jolokiaUrl: entity.$jolokiaUrl,
                    title: title,
                    returnTo: returnTo
                });
                Kubernetes.log.debug("Connect URI: ", connectUrl.toString());
                window.open(connectUrl.toString());
            };
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.DeploymentConfigController = Kubernetes.controller("DeploymentConfigController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = KubernetesSchema.definitions.os_deploy_DeploymentConfig;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                $scope.item = null;
                if ($scope.id) {
                    var url = Kubernetes.deploymentConfigRestUrl($scope.id);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.entity = data;
                            Kubernetes.enrichDeploymentConfig(data);
                        }
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
                else {
                    $scope.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.DeploymentConfigsController = Kubernetes.controller("DeploymentConfigsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.labelClass = Kubernetes.containerLabelClass;
            $scope.tableConfig = {
                data: 'deploymentConfigs',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'metadata.name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("deploymentConfigLinkTemplate.html")
                    },
                    {
                        field: 'metadata.namespace',
                        displayName: 'Namespace'
                    },
                    {
                        field: '$imageChangeParams.automatic',
                        displayName: 'Automatic'
                    },
                    {
                        field: '$imageChangeParams.$containerNames',
                        displayName: 'Container Names'
                    },
                    {
                        field: '$imageChangeParams.from.name',
                        displayName: 'From image'
                    },
                    {
                        field: '$imageChangeParams.tag',
                        displayName: 'Tag'
                    },
                    {
                        field: 'template.controllerTemplate.podTemplate.tags',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("deploymentConfigLabelTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.deletePrompt = function (selected) {
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: '$name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    deleteEntity(next, function () {
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                                else {
                                    updateData();
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Deployment?',
                    action: 'The following Deployments will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            function deleteEntity(selection, nextCallback) {
                var name = (selection || {}).$name;
                if (name) {
                    console.log("About to delete deployment config: " + name);
                    var url = Kubernetes.deploymentConfigRestUrl(name);
                    $http.delete(url).
                        success(function (data, status, headers, config) {
                        nextCallback();
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to delete deployment config on " + url + " " + data + " " + status);
                    });
                }
                else {
                    console.log("warning: no name for selection: " + angular.toJson(selection));
                }
            }
            function updateData() {
                var url = Kubernetes.deploymentConfigsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        //console.log("got data " + angular.toJson(data, true));
                        $scope.deploymentConfigs = Kubernetes.enrichDeploymentConfigs(data.items);
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
            updateData();
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.EventsController = Kubernetes.controller("EventsController", ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesServices, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');
            $scope.tableConfig = {
                data: 'model.events',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    { field: '$firstTimestamp',
                        displayName: 'First Seen',
                        cellTemplate: $templateCache.get("firstTimestampTemplate.html")
                    },
                    { field: '$lastTimestamp',
                        displayName: 'Last Seen',
                        cellTemplate: $templateCache.get("lastTimestampTemplate.html")
                    },
                    { field: 'count',
                        displayName: 'Count'
                    },
                    { field: 'involvedObject.name',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("eventNameTemplate.html")
                    },
                    { field: 'involvedObject.kind',
                        displayName: 'Kind',
                        cellTemplate: $templateCache.get("eventKindTemplate.html")
                    },
                    { field: 'involvedObject.fieldPath',
                        displayName: 'Subject'
                    },
                    { field: 'reason',
                        displayName: 'Reason'
                    },
                    { field: 'source',
                        displayName: 'Source',
                        cellTemplate: $templateCache.get("eventSourceTemplate.html")
                    },
                    { field: 'message',
                        displayName: 'Message'
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.FABRIC8_PROJECT_JSON = "fabric8ProjectJson";
    function byId(thing) {
        return thing.id;
    }
    function createKey(namespace, id, kind) {
        return (namespace || "") + "-" + (kind || 'undefined').toLowerCase() + '-' + (id || 'undefined').replace(/\./g, '-');
    }
    function populateKey(item) {
        var result = item;
        result['_key'] = createKey(Kubernetes.getNamespace(item), Kubernetes.getName(item), Kubernetes.getKind(item));
        return result;
    }
    function populateKeys(items) {
        var result = [];
        angular.forEach(items, function (item) {
            result.push(populateKey(item));
        });
        return result;
    }
    function selectPods(pods, namespace, labels) {
        return pods.filter(function (pod) {
            return Kubernetes.getNamespace(pod) === namespace && Kubernetes.selectorMatches(labels, Kubernetes.getLabels(pod));
        });
    }
    /**
     * The object which keeps track of all the pods, replication controllers, services and their associations
     */
    var KubernetesModelService = (function () {
        function KubernetesModelService() {
            this.kubernetes = null;
            this.apps = [];
            this.services = [];
            this.replicationcontrollers = [];
            this.pods = [];
            this.hosts = [];
            //public namespaces = [];
            this.routes = [];
            this.templates = [];
            this.redraw = false;
            this.resourceVersions = {};
            // various views on the data
            this.podsByHost = {};
            this.servicesByKey = {};
            this.replicationControllersByKey = {};
            this.podsByKey = {};
            this.appInfos = [];
            this.appViews = [];
            this.appFolders = [];
            this.fetched = false;
            this.showRunButton = false;
            this.buildconfigs = [];
            this.events = [];
            this.workspaces = [];
            this.projects = [];
            this.project = null;
        }
        Object.defineProperty(KubernetesModelService.prototype, "replicationControllers", {
            get: function () {
                return this.replicationcontrollers;
            },
            set: function (replicationControllers) {
                this.replicationcontrollers = replicationControllers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KubernetesModelService.prototype, "namespaces", {
            get: function () {
                return this.kubernetes.namespaces;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KubernetesModelService.prototype, "serviceApps", {
            get: function () {
                return _.filter(this.services, function (s) {
                    return s.$host && s.$serviceUrl && s.$podCount;
                });
            },
            enumerable: true,
            configurable: true
        });
        KubernetesModelService.prototype.$keepPolling = function () {
            return Kubernetes.keepPollingModel;
        };
        KubernetesModelService.prototype.orRedraw = function (flag) {
            this.redraw = this.redraw || flag;
        };
        KubernetesModelService.prototype.getService = function (namespace, id) {
            return this.servicesByKey[createKey(namespace, id, 'service')];
        };
        KubernetesModelService.prototype.getReplicationController = function (namespace, id) {
            return this.replicationControllersByKey[createKey(namespace, id, 'replicationController')];
        };
        KubernetesModelService.prototype.getPod = function (namespace, id) {
            return this.podsByKey[createKey(namespace, id, 'pod')];
        };
        KubernetesModelService.prototype.podsForNamespace = function (namespace) {
            if (namespace === void 0) { namespace = this.currentNamespace(); }
            return _.filter(this.pods, { namespace: namespace });
        };
        KubernetesModelService.prototype.getBuildConfig = function (name) {
            return _.find(this.buildconfigs, { $name: name });
        };
        KubernetesModelService.prototype.getProject = function (name, ns) {
            if (ns === void 0) { ns = this.currentNamespace(); }
            var buildConfig = this.project;
            if (!buildConfig) {
                var text = localStorage[Kubernetes.FABRIC8_PROJECT_JSON];
                if (text) {
                    try {
                        buildConfig = angular.fromJson(text);
                    }
                    catch (e) {
                        Kubernetes.log.warn("Could not parse json for " + Kubernetes.FABRIC8_PROJECT_JSON + ". Was: " + text + ". " + e, e);
                    }
                }
            }
            if (buildConfig && ns != Kubernetes.getNamespace(buildConfig) && name != buildConfig.$name) {
                buildConfig = this.getBuildConfig(name);
            }
            return buildConfig;
        };
        KubernetesModelService.prototype.setProject = function (buildConfig) {
            this.project = buildConfig;
            if (buildConfig) {
                // lets store in local storage
                var localStorage = Kubernetes.inject("localStorage");
                if (localStorage) {
                    localStorage[Kubernetes.FABRIC8_PROJECT_JSON] = angular.toJson(buildConfig);
                }
            }
        };
        /**
         * Returns the current selected namespace or the default namespace
         */
        KubernetesModelService.prototype.currentNamespace = function () {
            var answer = null;
            if (this.kubernetes) {
                answer = this.kubernetes.selectedNamespace;
            }
            return answer || Kubernetes.defaultNamespace;
        };
        KubernetesModelService.prototype.updateIconUrlAndAppInfo = function (entity, nameField) {
            var answer = null;
            var id = Kubernetes.getName(entity);
            entity.$iconUrl = Core.pathGet(entity, ['metadata', 'annotations', 'fabric8.' + id + '/iconUrl']);
            entity.$info = Core.pathGet(entity, ['metadata', 'annotations', 'fabric8.' + id + '/summary']);
            if (entity.$iconUrl) {
                return;
            }
            if (id && nameField) {
                (this.templates || []).forEach(function (template) {
                    var metadata = template.metadata;
                    if (metadata) {
                        var annotations = metadata.annotations || {};
                        var iconUrl = annotations["fabric8." + id + "/iconUrl"] || annotations["fabric8/iconUrl"];
                        if (iconUrl) {
                            (template.objects || []).forEach(function (item) {
                                var entityName = Kubernetes.getName(item);
                                if (id === entityName) {
                                    entity.$iconUrl = iconUrl;
                                }
                            });
                        }
                    }
                });
                (this.appInfos || []).forEach(function (appInfo) {
                    var iconPath = appInfo.iconPath;
                    if (iconPath && !answer && iconPath !== "null") {
                        var iconUrl = Kubernetes.gitPathToUrl(iconPath);
                        var ids = Core.pathGet(appInfo, ["names", nameField]);
                        angular.forEach(ids, function (appId) {
                            if (appId === id) {
                                entity.$iconUrl = iconUrl;
                                entity.appPath = appInfo.appPath;
                                entity.$info = appInfo;
                            }
                        });
                    }
                });
            }
            if (!entity.$iconUrl) {
                entity.$iconUrl = Kubernetes.defaultIconUrl;
            }
        };
        KubernetesModelService.prototype.maybeInit = function () {
            var _this = this;
            this.fetched = true;
            this.servicesByKey = {};
            this.podsByKey = {};
            this.replicationControllersByKey = {};
            this.pods.forEach(function (pod) {
                if (!pod.kind)
                    pod.kind = "Pod";
                _this.podsByKey[pod._key] = pod;
                var host = Kubernetes.getHost(pod);
                pod.$labelsText = Kubernetes.labelsToString(Kubernetes.getLabels(pod));
                if (host) {
                    pod.$labelsText += Kubernetes.labelFilterTextSeparator + "host=" + host;
                }
                pod.$iconUrl = Kubernetes.defaultIconUrl;
                _this.discoverPodConnections(pod);
                pod.$containerPorts = [];
                var podStatus = pod.status || {};
                var startTime = podStatus.startTime;
                pod.$startTime = null;
                if (startTime) {
                    pod.$startTime = new Date(startTime);
                }
                var createdTime = Kubernetes.getCreationTimestamp(pod);
                pod.$createdTime = null;
                pod.$age = null;
                if (createdTime) {
                    pod.$createdTime = new Date(createdTime);
                    pod.$age = pod.$createdTime.relative();
                }
                var ready = Kubernetes.isReady(pod);
                pod.$ready = ready;
                pod.$statusCss = Kubernetes.statusTextToCssClass(podStatus.phase, ready);
                var maxRestartCount = 0;
                angular.forEach(Core.pathGet(pod, ["status", "containerStatuses"]), function (status) {
                    var restartCount = status.restartCount;
                    if (restartCount) {
                        if (restartCount > maxRestartCount) {
                            maxRestartCount = restartCount;
                        }
                    }
                });
                if (maxRestartCount) {
                    pod.$restartCount = maxRestartCount;
                }
                var imageNames = "";
                angular.forEach(Core.pathGet(pod, ["spec", "containers"]), function (container) {
                    var image = container.image;
                    if (image) {
                        if (!imageNames) {
                            imageNames = image;
                        }
                        else {
                            imageNames = imageNames + " " + image;
                        }
                        var idx = image.lastIndexOf(":");
                        if (idx > 0) {
                            image = image.substring(0, idx);
                        }
                        var paths = image.split("/", 3);
                        if (paths.length) {
                            var answer = null;
                            if (paths.length == 3) {
                                answer = paths[1] + "/" + paths[2];
                            }
                            else if (paths.length == 2) {
                                answer = paths[0] + "/" + paths[1];
                            }
                            else {
                                answer = paths[0] + "/" + paths[1];
                            }
                            container.$imageLink = UrlHelpers.join("https://registry.hub.docker.com/u/", answer);
                        }
                    }
                    angular.forEach(container.ports, function (port) {
                        var containerPort = port.containerPort;
                        if (containerPort) {
                            pod.$containerPorts.push(containerPort);
                        }
                    });
                });
                pod.$imageNames = imageNames;
                var podStatus = podStatus;
                var podSpec = (pod.spec || {});
                pod.$podIP = podStatus.podIP;
                pod.$host = podSpec.host || podSpec.nodeName || podStatus.hostIP;
            });
            this.services.forEach(function (service) {
                if (!service.kind)
                    service.kind = "Service";
                _this.servicesByKey[service._key] = service;
                var selector = Kubernetes.getSelector(service);
                service.$pods = [];
                if (!service.$podCounters) {
                    service.$podCounters = {};
                }
                _.assign(service.$podCounters, selector ? Kubernetes.createPodCounters(selector, _this.pods, service.$pods) : {});
                service.$podCount = service.$pods.length;
                var selectedPods = service.$pods;
                service.connectTo = selectedPods.map(function (pod) {
                    return pod._key;
                }).join(',');
                service.$labelsText = Kubernetes.labelsToString(Kubernetes.getLabels(service));
                _this.updateIconUrlAndAppInfo(service, "serviceNames");
                var spec = service.spec || {};
                service.$portalIP = spec.portalIP;
                service.$selectorText = Kubernetes.labelsToString(spec.selector);
                var ports = _.map(spec.ports || [], "port");
                service.$ports = ports;
                service.$portsText = ports.join(", ");
                var iconUrl = service.$iconUrl;
                if (iconUrl && selectedPods) {
                    selectedPods.forEach(function (pod) {
                        pod.$iconUrl = iconUrl;
                    });
                }
                service.$serviceUrl = Kubernetes.serviceLinkUrl(service);
            });
            this.replicationControllers.forEach(function (replicationController) {
                if (!replicationController.kind)
                    replicationController.kind = "ReplicationController";
                _this.replicationControllersByKey[replicationController._key] = replicationController;
                var selector = Kubernetes.getSelector(replicationController);
                replicationController.$pods = [];
                replicationController.$podCounters = selector ? Kubernetes.createPodCounters(selector, _this.pods, replicationController.$pods) : null;
                replicationController.$podCount = replicationController.$pods.length;
                replicationController.$replicas = (replicationController.spec || {}).replicas;
                var selectedPods = replicationController.$pods;
                replicationController.connectTo = selectedPods.map(function (pod) {
                    return pod._key;
                }).join(',');
                replicationController.$labelsText = Kubernetes.labelsToString(Kubernetes.getLabels(replicationController));
                _this.updateIconUrlAndAppInfo(replicationController, "replicationControllerNames");
                var iconUrl = replicationController.$iconUrl;
                if (iconUrl && selectedPods) {
                    selectedPods.forEach(function (pod) {
                        pod.$iconUrl = iconUrl;
                    });
                }
            });
            // services may not map to an icon but their pods may do via the RC
            // so lets default it...
            this.services.forEach(function (service) {
                var iconUrl = service.$iconUrl;
                var selectedPods = service.$pods;
                if (selectedPods) {
                    if (!iconUrl || iconUrl === Kubernetes.defaultIconUrl) {
                        iconUrl = null;
                        selectedPods.forEach(function (pod) {
                            if (!iconUrl) {
                                iconUrl = pod.$iconUrl;
                                if (iconUrl) {
                                    service.$iconUrl = iconUrl;
                                }
                            }
                        });
                    }
                }
            });
            this.updateApps();
            var podsByHost = {};
            this.pods.forEach(function (pod) {
                var host = Kubernetes.getHost(pod);
                var podsForHost = podsByHost[host];
                if (!podsForHost) {
                    podsForHost = [];
                    podsByHost[host] = podsForHost;
                }
                podsForHost.push(pod);
            });
            this.podsByHost = podsByHost;
            var tmpHosts = [];
            for (var hostKey in podsByHost) {
                var hostPods = [];
                var podCounters = Kubernetes.createPodCounters(function (pod) { return Kubernetes.getHost(pod) === hostKey; }, this.pods, hostPods, "host=" + hostKey);
                var hostIP = null;
                if (hostPods.length) {
                    var pod = hostPods[0];
                    var currentState = pod.status;
                    if (currentState) {
                        hostIP = currentState.hostIP;
                    }
                }
                var hostDetails = {
                    name: hostKey,
                    id: hostKey,
                    elementId: hostKey.replace(/\./g, '_'),
                    hostIP: hostIP,
                    pods: hostPods,
                    kind: "Host",
                    $podCounters: podCounters,
                    $iconUrl: Kubernetes.hostIconUrl
                };
                tmpHosts.push(hostDetails);
            }
            this.hosts = tmpHosts;
            Kubernetes.enrichBuildConfigs(this.buildconfigs);
            Kubernetes.enrichEvents(this.events, this);
        };
        KubernetesModelService.prototype.updateApps = function () {
            var _this = this;
            try {
                // lets create the app views by trying to join controllers / services / pods that are related
                var appViews = [];
                this.replicationControllers.forEach(function (replicationController) {
                    var name = Kubernetes.getName(replicationController);
                    var $iconUrl = replicationController.$iconUrl;
                    appViews.push({
                        appPath: "/dummyPath/" + name,
                        $name: name,
                        $info: {
                            $iconUrl: $iconUrl
                        },
                        $iconUrl: $iconUrl,
                        replicationControllers: [replicationController],
                        pods: replicationController.$pods || [],
                        services: []
                    });
                });
                var hasTemplatesService = Kubernetes.isOpenShift;
                var noMatches = [];
                this.services.forEach(function (service) {
                    var name = Kubernetes.getName(service);
                    if (name === "templates") {
                        var podCounters = service.$podCounters;
                        if (podCounters && podCounters.valid) {
                            hasTemplatesService = true;
                        }
                    }
                    // now lets see if we can find an app with an RC of the same selector
                    var matchesApp = null;
                    appViews.forEach(function (appView) {
                        appView.replicationControllers.forEach(function (replicationController) {
                            var repSelector = Kubernetes.getSelector(replicationController);
                            if (repSelector &&
                                Kubernetes.selectorMatches(repSelector, Kubernetes.getSelector(service)) &&
                                Kubernetes.getNamespace(service) === Kubernetes.getNamespace(replicationController)) {
                                matchesApp = appView;
                            }
                        });
                    });
                    if (matchesApp) {
                        matchesApp.services.push(service);
                    }
                    else {
                        noMatches.push(service);
                    }
                });
                Kubernetes.log.debug("no matches: ", noMatches);
                noMatches.forEach(function (service) {
                    var appView = _.find(appViews, function (appView) {
                        return _.any(appView.replicationControllers, function (rc) {
                            return _.startsWith(Kubernetes.getName(rc), Kubernetes.getName(service));
                        });
                    });
                    if (appView) {
                        appView.services.push(service);
                    }
                    else {
                        var $iconUrl = service.$iconUrl;
                        appViews.push({
                            appPath: "/dummyPath/" + name,
                            $name: name,
                            $info: {
                                $iconUrl: $iconUrl
                            },
                            $iconUrl: $iconUrl,
                            replicationControllers: [],
                            pods: service.$pods || [],
                            services: [service]
                        });
                    }
                });
                this.showRunButton = hasTemplatesService;
                angular.forEach(this.routes, function (route) {
                    var metadata = route.metadata || {};
                    var spec = route.spec || {};
                    var serviceName = Core.pathGet(spec, ["to", "name"]);
                    var host = spec.host;
                    var namespace = Kubernetes.getNamespace(route);
                    if (serviceName && host) {
                        var service = _this.getService(namespace, serviceName);
                        if (service) {
                            service.$host = host;
                            // TODO we could use some annotations / metadata to deduce what URL we should use to open this
                            // service in the console. For now just assume its http:
                            if (host) {
                                var hostUrl = host;
                                if (hostUrl.indexOf("://") < 0) {
                                    hostUrl = "http://" + host;
                                }
                                service.$connectUrl = UrlHelpers.join(hostUrl, "/");
                            }
                            // TODO definitely need that annotation, temp hack for apiman link
                            if (Kubernetes.getName(service) === 'apiman' && host) {
                                service.$connectUrl = new URI().host(service.$host)
                                    .path('apimanui/index.html')
                                    .query({})
                                    .hash(URI.encode(angular.toJson({
                                    backTo: new URI().toString(),
                                    token: HawtioOAuth.getOAuthToken()
                                }))).toString();
                            }
                        }
                        else {
                            Kubernetes.log.debug("Could not find service " + serviceName + " namespace " + namespace + " for route: " + metadata.name);
                        }
                    }
                });
                appViews = populateKeys(appViews).sortBy(function (appView) { return appView._key; });
                ArrayHelpers.sync(this.appViews, appViews, '$name');
                if (this.appInfos && this.appViews) {
                    var folderMap = {};
                    var folders = [];
                    var appMap = {};
                    angular.forEach(this.appInfos, function (appInfo) {
                        if (!appInfo.$iconUrl && appInfo.iconPath && appInfo.iconPath !== "null") {
                            appInfo.$iconUrl = Kubernetes.gitPathToUrl(appInfo.iconPath);
                        }
                        var appPath = appInfo.appPath;
                        if (appPath) {
                            appMap[appPath] = appInfo;
                            var idx = appPath.lastIndexOf("/");
                            var folderPath = "";
                            if (idx >= 0) {
                                folderPath = appPath.substring(0, idx);
                            }
                            folderPath = Core.trimLeading(folderPath, "/");
                            var folder = folderMap[folderPath];
                            if (!folder) {
                                folder = {
                                    path: folderPath,
                                    expanded: true,
                                    apps: []
                                };
                                folders.push(folder);
                                folderMap[folderPath] = folder;
                            }
                            folder.apps.push(appInfo);
                        }
                    });
                    this.appFolders = folders.sortBy("path");
                    var apps = [];
                    var defaultInfo = {
                        $iconUrl: Kubernetes.defaultIconUrl
                    };
                    angular.forEach(this.appViews, function (appView) {
                        try {
                            var appPath = appView.appPath;
                            /*
                             TODO
                             appView.$select = () => {
                             Kubernetes.setJson($scope, appView.id, $scope.model.apps);
                             };
                             */
                            var appInfo = angular.copy(defaultInfo);
                            if (appPath) {
                                appInfo = appMap[appPath] || appInfo;
                            }
                            if (!appView.$info) {
                                appView.$info = defaultInfo;
                                appView.$info = appInfo;
                            }
                            appView.id = appPath;
                            if (!appView.$name) {
                                appView.$name = appInfo.name || appView.$name;
                            }
                            if (!appView.$iconUrl) {
                                appView.$iconUrl = appInfo.$iconUrl;
                            }
                            apps.push(appView);
                            appView.$podCounters = Kubernetes.createAppViewPodCounters(appView);
                            appView.$podCount = (appView.pods || []).length;
                            appView.$replicationControllersText = (appView.replicationControllers || []).map("_key").join(" ");
                            appView.$servicesText = (appView.services || []).map("_key").join(" ");
                            appView.$serviceViews = Kubernetes.createAppViewServiceViews(appView);
                        }
                        catch (e) {
                            Kubernetes.log.warn("Failed to update appViews: " + e);
                        }
                    });
                    //this.apps = apps;
                    this.apps = this.appViews;
                }
            }
            catch (e) {
                Kubernetes.log.warn("Caught error: " + e);
            }
        };
        KubernetesModelService.prototype.discoverPodConnections = function (entity) {
            var info = Core.pathGet(entity, ["status", "info"]);
            var hostPort = null;
            var currentState = entity.status || {};
            var desiredState = entity.spec || {};
            var podId = Kubernetes.getName(entity);
            var host = currentState["hostIP"];
            var podIP = currentState["podIP"];
            var hasDocker = false;
            var foundContainerPort = null;
            if (desiredState) {
                var containers = desiredState.containers;
                angular.forEach(containers, function (container) {
                    if (!hostPort) {
                        var ports = container.ports;
                        angular.forEach(ports, function (port) {
                            if (!hostPort) {
                                var containerPort = port.containerPort;
                                var portName = port.name;
                                var containerHostPort = port.hostPort;
                                if (containerPort === 8778 || "jolokia" === portName) {
                                    if (containerPort) {
                                        if (podIP) {
                                            foundContainerPort = containerPort;
                                        }
                                        if (containerHostPort) {
                                            hostPort = containerHostPort;
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
            if (foundContainerPort && podId && Kubernetes.isRunning(currentState)) {
                if (!Kubernetes.isOpenShift) {
                    // TODO temp workaround for k8s on GKE https://github.com/kubernetes/kubernetes/issues/17172
                    entity.$jolokiaUrl = UrlHelpers.join(Kubernetes.masterApiUrl(), "api", Kubernetes.defaultApiVersion, "proxy", "namespaces", entity.metadata.namespace, "pods", 
                    //"https:" + podId + ":" + foundContainerPort,
                    podId + ":" + foundContainerPort, "jolokia/");
                }
                else {
                    entity.$jolokiaUrl = UrlHelpers.join(Kubernetes.masterApiUrl(), "api", Kubernetes.defaultApiVersion, "namespaces", entity.metadata.namespace, "pods", "https:" + podId + ":" + foundContainerPort, "proxy/jolokia/");
                }
            }
        };
        return KubernetesModelService;
    }());
    Kubernetes.KubernetesModelService = KubernetesModelService;
    /**
     * Creates a model service which keeps track of all the pods, replication controllers and services along
     * with their associations and status
     */
    Kubernetes._module.factory('KubernetesModel', ['$rootScope', '$http', 'KubernetesApiURL', 'KubernetesState', 'WatcherService', '$location', '$resource', function ($rootScope, $http, AppLibraryURL, KubernetesState, watcher, $location, $resource) {
            var $scope = new KubernetesModelService();
            $scope.kubernetes = KubernetesState;
            // create all of our resource classes
            var typeNames = watcher.getTypes();
            _.forEach(typeNames, function (type) {
                var urlTemplate = Kubernetes.uriTemplateForKubernetesKind(type);
                $scope[type + 'Resource'] = Kubernetes.createResource(type, urlTemplate, $resource, $scope);
            });
            // register for all updates on objects
            watcher.registerListener(function (objects) {
                var types = watcher.getTypes();
                _.forEach(types, function (type) {
                    switch (type) {
                        case Kubernetes.WatchTypes.SERVICES:
                            var items = populateKeys(objects[type]);
                            angular.forEach(items, function (item) {
                                item.proxyUrl = Kubernetes.kubernetesProxyUrlForService(Kubernetes.masterApiUrl(), item);
                            });
                            $scope[type] = items;
                            break;
                        case Kubernetes.WatchTypes.TEMPLATES:
                        case Kubernetes.WatchTypes.ROUTES:
                        case Kubernetes.WatchTypes.BUILDS:
                        case Kubernetes.WatchTypes.BUILD_CONFIGS:
                        case Kubernetes.WatchTypes.IMAGE_STREAMS:
                        // don't put a break here :-)
                        default:
                            $scope[type] = populateKeys(objects[type]);
                    }
                    Kubernetes.log.debug("Type: ", type, " object: ", $scope[type]);
                });
                $scope.maybeInit();
                $rootScope.$broadcast('kubernetesModelUpdated', $scope);
                Core.$apply($rootScope);
            });
            // set the selected namespace if set in the location bar
            // otherwise use whatever previously selected namespace is
            // available
            var search = $location.search();
            if ('namespace' in search) {
                watcher.setNamespace(search['namespace']);
            }
            function selectPods(pods, namespace, labels) {
                return pods.filter(function (pod) {
                    return Kubernetes.getNamespace(pod) === namespace && Kubernetes.selectorMatches(labels, Kubernetes.getLabels(pod));
                });
            }
            return $scope;
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.HostController = Kubernetes.controller("HostController", ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.rawMode = false;
            $scope.rawModel = null;
            $scope.itemConfig = {
                properties: {}
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.flipRaw = function () {
                $scope.rawMode = !$scope.rawMode;
                Core.$apply($scope);
            };
            updateData();
            function updateData() {
                $scope.id = $routeParams["id"];
                $scope.item = null;
                if ($scope.id) {
                    var url = UrlHelpers.join(KubernetesApiURL, "nodes", $scope.id);
                    $http.get(url).
                        success(function (data, status, headers, config) {
                        if (data) {
                            $scope.item = data;
                        }
                        if ($scope.item) {
                            $scope.rawModel = JSON.stringify($scope.item, null, 2); // spacing level = 2
                        }
                        Core.$apply($scope);
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    });
                }
                else {
                    $scope.rawModel = null;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
var Kubernetes;
(function (Kubernetes) {
    /**
     * Sorts the the ip field
     *
     * @param ip the ip such as '10.1.2.13'
     * @returns {any}
     */
    function sortByPodIp(ip) {
        // i guess there is maybe nicer ways of sort this without parsing and slicing
        var regex = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/;
        var groups = regex.exec(ip);
        if (angular.isDefined(groups)) {
            var g1 = ("00" + groups[1]).slice(-3);
            var g2 = ("00" + groups[2]).slice(-3);
            var g3 = ("00" + groups[3]).slice(-3);
            var g4 = ("00" + groups[4]).slice(-3);
            var answer = g1 + g2 + g3 + g4;
            return answer;
        }
        else {
            return 0;
        }
    }
    Kubernetes.sortByPodIp = sortByPodIp;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
/// <reference path="utilHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.HostsController = Kubernetes.controller("HostsController", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesPods, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.tableConfig = {
                data: 'model.hosts',
                showSelectionCheckbox: false,
                enableRowClickSelection: false,
                multiSelect: false,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'Name',
                        defaultSort: true,
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    {
                        field: 'hostIP',
                        displayName: 'IP',
                        customSortField: function (field) {
                            // use a custom sort to sort ip address
                            return Kubernetes.sortByPodIp(field.hostIP);
                        }
                    },
                    { field: '$podsLink',
                        displayName: 'Pods',
                        cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html"),
                        customSortField: function (field) {
                            // need to concat all the pod counters
                            var ready = field.$podCounters.ready || 0;
                            var valid = field.$podCounters.valid || 0;
                            var waiting = field.$podCounters.waiting || 0;
                            var error = field.$podCounters.error || 0;
                            return ready + valid + waiting + error;
                        }
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ImageRepositoriesController = Kubernetes.controller("ImageRepositoriesController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.tableConfig = {
                data: 'imageRepositories',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: 'metadata.name',
                        displayName: 'Name'
                    },
                    {
                        field: 'metadata.namespace',
                        displayName: 'Namespace'
                    },
                    {
                        field: 'status.dockerImageRepository',
                        displayName: 'Docker Registry'
                    },
                    {
                        field: 'tags',
                        displayName: 'Tags',
                        cellTemplate: $templateCache.get('imageRegistryLabelTemplate.html')
                    }
                ]
            };
            var labelColors = {
                'prod': 'background-blue',
                'valid': 'background-light-green',
                'test': 'background-light-grey'
            };
            $scope.labelClass = function (labelType) {
                if (!(labelType in labelColors)) {
                    return 'mouse-pointer';
                }
                else
                    return labelColors[labelType] + ' mouse-pointer';
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.deletePrompt = function (selected) {
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: '$name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    deleteEntity(next, function () {
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                                else {
                                    updateData();
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Image Repository?',
                    action: 'The following Image Repositories will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            function deleteEntity(selection, nextCallback) {
                var name = (selection || {}).$name;
                if (name) {
                    console.log("About to delete image repository: " + name);
                    var url = Kubernetes.imageRepositoryRestUrl(name);
                    $http.delete(url).
                        success(function (data, status, headers, config) {
                        nextCallback();
                    }).
                        error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to delete image repository on " + url + " " + data + " " + status);
                    });
                }
                else {
                    console.log("warning: no name for selection: " + angular.toJson(selection));
                }
            }
            function updateData() {
                var url = Kubernetes.imageRepositoriesRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        //console.log("got data " + angular.toJson(data, true));
                        $scope.imageRepositories = Kubernetes.enrichImageRepositories(data.items);
                        $scope.fetched = true;
                        Core.$apply($scope);
                    }
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
            updateData();
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    function selectSubNavBar($scope, tabName, newSubTabLabel) {
        var foundTab = null;
        angular.forEach($scope.subTabConfig, function (tab) {
            if (tabName === tab.label || tabName === tab.id) {
                foundTab = tab;
            }
        });
        var breadcrumbConfig = $scope.breadcrumbConfig;
        if (foundTab && breadcrumbConfig) {
            breadcrumbConfig.push(foundTab);
            $scope.subTabConfig = [
                {
                    label: newSubTabLabel
                }
            ];
        }
    }
    Kubernetes.selectSubNavBar = selectSubNavBar;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.schema = {
        "id": "http://fabric8.io/fabric8/v2/Schema#",
        "$schema": "http://json-schema.org/schema#",
        "definitions": {
            "api_RootPaths": {
                "type": "object",
                "description": "",
                "properties": {
                    "paths": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "type": "string",
                            "description": ""
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.RootPaths"
            },
            "kubernetes_AWSElasticBlockStoreVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "fsType": {
                        "type": "string",
                        "description": "file system type to mount"
                    },
                    "partition": {
                        "type": "integer",
                        "description": "partition on the disk to mount (e.g."
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "read-only if true"
                    },
                    "volumeID": {
                        "type": "string",
                        "description": "unique id of the PD resource in AWS; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#awselasticblockstore"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.AWSElasticBlockStoreVolumeSource"
            },
            "kubernetes_Capabilities": {
                "type": "object",
                "description": "",
                "properties": {
                    "add": {
                        "type": "array",
                        "description": "added capabilities",
                        "items": {
                            "type": "string",
                            "description": "added capabilities"
                        }
                    },
                    "drop": {
                        "type": "array",
                        "description": "droped capabilities",
                        "items": {
                            "type": "string",
                            "description": "droped capabilities"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Capabilities"
            },
            "kubernetes_CephFSVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "monitors": {
                        "type": "array",
                        "description": "a collection of Ceph monitors",
                        "items": {
                            "type": "string",
                            "description": "a collection of Ceph monitors"
                        }
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "Ceph fs to be mounted with read-only permissions"
                    },
                    "secretFile": {
                        "type": "string",
                        "description": "path to secret for rados user; default is /etc/ceph/user.secret; optional"
                    },
                    "secretRef": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    },
                    "user": {
                        "type": "string",
                        "description": "rados user name; default is admin; optional"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.CephFSVolumeSource"
            },
            "kubernetes_Container": {
                "type": "object",
                "description": "",
                "properties": {
                    "args": {
                        "type": "array",
                        "description": "command array; the docker image's cmd is used if this is not provided; arguments to the entrypoint; cannot be updated; variable references $(VAR_NAME) are expanded using the container's environment variables; if a variable cannot be resolved",
                        "items": {
                            "type": "string",
                            "description": "command array; the docker image's cmd is used if this is not provided; arguments to the entrypoint; cannot be updated; variable references $(VAR_NAME) are expanded using the container's environment variables; if a variable cannot be resolved"
                        }
                    },
                    "command": {
                        "type": "array",
                        "description": "entrypoint array; not executed within a shell; the docker image's entrypoint is used if this is not provided; cannot be updated; variable references $(VAR_NAME) are expanded using the container's environment variables; if a variable cannot be resolved",
                        "items": {
                            "type": "string",
                            "description": "entrypoint array; not executed within a shell; the docker image's entrypoint is used if this is not provided; cannot be updated; variable references $(VAR_NAME) are expanded using the container's environment variables; if a variable cannot be resolved"
                        }
                    },
                    "env": {
                        "type": "array",
                        "description": "list of environment variables to set in the container; cannot be updated",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    },
                    "image": {
                        "type": "string",
                        "description": "Docker image name; see http://releases.k8s.io/HEAD/docs/user-guide/images.md"
                    },
                    "imagePullPolicy": {
                        "type": "string",
                        "description": "image pull policy; one of Always"
                    },
                    "lifecycle": {
                        "$ref": "#/definitions/kubernetes_Lifecycle",
                        "javaType": "io.fabric8.kubernetes.api.model.Lifecycle"
                    },
                    "livenessProbe": {
                        "$ref": "#/definitions/kubernetes_Probe",
                        "javaType": "io.fabric8.kubernetes.api.model.Probe"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the container; must be a DNS_LABEL and unique within the pod; cannot be updated",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "ports": {
                        "type": "array",
                        "description": "list of ports to expose from the container; cannot be updated",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ContainerPort",
                            "javaType": "io.fabric8.kubernetes.api.model.ContainerPort"
                        }
                    },
                    "readinessProbe": {
                        "$ref": "#/definitions/kubernetes_Probe",
                        "javaType": "io.fabric8.kubernetes.api.model.Probe"
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_ResourceRequirements",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
                    },
                    "securityContext": {
                        "$ref": "#/definitions/kubernetes_SecurityContext",
                        "javaType": "io.fabric8.kubernetes.api.model.SecurityContext"
                    },
                    "stdin": {
                        "type": "boolean",
                        "description": "Whether this container should allocate a buffer for stdin in the container runtime; default is false"
                    },
                    "terminationMessagePath": {
                        "type": "string",
                        "description": "path at which the file to which the container's termination message will be written is mounted into the container's filesystem; message written is intended to be brief final status"
                    },
                    "tty": {
                        "type": "boolean",
                        "description": "Whether this container should allocate a TTY for itself"
                    },
                    "volumeMounts": {
                        "type": "array",
                        "description": "pod volumes to mount into the container's filesyste; cannot be updated",
                        "items": {
                            "$ref": "#/definitions/kubernetes_VolumeMount",
                            "javaType": "io.fabric8.kubernetes.api.model.VolumeMount"
                        }
                    },
                    "workingDir": {
                        "type": "string",
                        "description": "container's working directory; defaults to image's default; cannot be updated"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Container"
            },
            "kubernetes_ContainerPort": {
                "type": "object",
                "description": "",
                "properties": {
                    "containerPort": {
                        "type": "integer",
                        "description": "number of port to expose on the pod's IP address"
                    },
                    "hostIP": {
                        "type": "string",
                        "description": "host IP to bind the port to"
                    },
                    "hostPort": {
                        "type": "integer",
                        "description": "number of port to expose on the host; most containers do not need this"
                    },
                    "name": {
                        "type": "string",
                        "description": "name for the port that can be referred to by services; must be an IANA_SVC_NAME and unique within the pod"
                    },
                    "protocol": {
                        "type": "string",
                        "description": "protocol for port; must be UDP or TCP; TCP if unspecified"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerPort"
            },
            "kubernetes_ContainerState": {
                "type": "object",
                "description": "",
                "properties": {
                    "running": {
                        "$ref": "#/definitions/kubernetes_ContainerStateRunning",
                        "javaType": "io.fabric8.kubernetes.api.model.ContainerStateRunning"
                    },
                    "terminated": {
                        "$ref": "#/definitions/kubernetes_ContainerStateTerminated",
                        "javaType": "io.fabric8.kubernetes.api.model.ContainerStateTerminated"
                    },
                    "waiting": {
                        "$ref": "#/definitions/kubernetes_ContainerStateWaiting",
                        "javaType": "io.fabric8.kubernetes.api.model.ContainerStateWaiting"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerState"
            },
            "kubernetes_ContainerStateRunning": {
                "type": "object",
                "description": "",
                "properties": {
                    "startedAt": {
                        "type": "string",
                        "description": "time at which the container was last (re-)started"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerStateRunning"
            },
            "kubernetes_ContainerStateTerminated": {
                "type": "object",
                "description": "",
                "properties": {
                    "containerID": {
                        "type": "string",
                        "description": "container's ID in the format 'docker://\u003ccontainer_id\u003e'"
                    },
                    "exitCode": {
                        "type": "integer",
                        "description": "exit status from the last termination of the container"
                    },
                    "finishedAt": {
                        "type": "string",
                        "description": "time at which the container last terminated"
                    },
                    "message": {
                        "type": "string",
                        "description": "message regarding the last termination of the container"
                    },
                    "reason": {
                        "type": "string",
                        "description": "(brief) reason from the last termination of the container"
                    },
                    "signal": {
                        "type": "integer",
                        "description": "signal from the last termination of the container"
                    },
                    "startedAt": {
                        "type": "string",
                        "description": "time at which previous execution of the container started"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerStateTerminated"
            },
            "kubernetes_ContainerStateWaiting": {
                "type": "object",
                "description": "",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "(brief) reason the container is not yet running"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerStateWaiting"
            },
            "kubernetes_ContainerStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "containerID": {
                        "type": "string",
                        "description": "container's ID in the format 'docker://\u003ccontainer_id\u003e'; see http://releases.k8s.io/HEAD/docs/user-guide/container-environment.md#container-information"
                    },
                    "image": {
                        "type": "string",
                        "description": "image of the container; see http://releases.k8s.io/HEAD/docs/user-guide/images.md"
                    },
                    "imageID": {
                        "type": "string",
                        "description": "ID of the container's image"
                    },
                    "lastState": {
                        "$ref": "#/definitions/kubernetes_ContainerState",
                        "javaType": "io.fabric8.kubernetes.api.model.ContainerState"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the container; must be a DNS_LABEL and unique within the pod; cannot be updated",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "ready": {
                        "type": "boolean",
                        "description": "specifies whether the container has passed its readiness probe"
                    },
                    "restartCount": {
                        "type": "integer",
                        "description": "the number of times the container has been restarted"
                    },
                    "state": {
                        "$ref": "#/definitions/kubernetes_ContainerState",
                        "javaType": "io.fabric8.kubernetes.api.model.ContainerState"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ContainerStatus"
            },
            "kubernetes_EmptyDirVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "medium": {
                        "type": "string",
                        "description": "type of storage used to back the volume; must be an empty string (default) or Memory; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#emptydir"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EmptyDirVolumeSource"
            },
            "kubernetes_EndpointAddress": {
                "type": "object",
                "description": "",
                "properties": {
                    "ip": {
                        "type": "string",
                        "description": "IP address of the endpoint"
                    },
                    "targetRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EndpointAddress"
            },
            "kubernetes_EndpointPort": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of this port",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "port": {
                        "type": "integer",
                        "description": "port number of the endpoint"
                    },
                    "protocol": {
                        "type": "string",
                        "description": "protocol for this port; must be UDP or TCP; TCP if unspecified"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EndpointPort"
            },
            "kubernetes_EndpointSubset": {
                "type": "object",
                "description": "",
                "properties": {
                    "addresses": {
                        "type": "array",
                        "description": "IP addresses which offer the related ports",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EndpointAddress",
                            "javaType": "io.fabric8.kubernetes.api.model.EndpointAddress"
                        }
                    },
                    "ports": {
                        "type": "array",
                        "description": "port numbers available on the related IP addresses",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EndpointPort",
                            "javaType": "io.fabric8.kubernetes.api.model.EndpointPort"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EndpointSubset"
            },
            "kubernetes_Endpoints": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Endpoints",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "subsets": {
                        "type": "array",
                        "description": "sets of addresses and ports that comprise a service",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EndpointSubset",
                            "javaType": "io.fabric8.kubernetes.api.model.EndpointSubset"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Endpoints",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_EndpointsList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of endpoints",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Endpoints",
                            "javaType": "io.fabric8.kubernetes.api.model.Endpoints"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "EndpointsList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EndpointsList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_EnvVar": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the environment variable; must be a C_IDENTIFIER",
                        "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
                    },
                    "value": {
                        "type": "string",
                        "description": "value of the environment variable; defaults to empty string; variable references $(VAR_NAME) are expanded using the previously defined environment varibles in the container and any service environment variables; if a variable cannot be resolved"
                    },
                    "valueFrom": {
                        "$ref": "#/definitions/kubernetes_EnvVarSource",
                        "javaType": "io.fabric8.kubernetes.api.model.EnvVarSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
            },
            "kubernetes_EnvVarSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "fieldRef": {
                        "$ref": "#/definitions/kubernetes_ObjectFieldSelector",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectFieldSelector"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EnvVarSource"
            },
            "kubernetes_Event": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "count": {
                        "type": "integer",
                        "description": "the number of times this event has occurred"
                    },
                    "firstTimestamp": {
                        "type": "string",
                        "description": "the time at which the event was first recorded"
                    },
                    "involvedObject": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Event",
                        "required": true
                    },
                    "lastTimestamp": {
                        "type": "string",
                        "description": "the time at which the most recent occurrence of this event was recorded"
                    },
                    "message": {
                        "type": "string",
                        "description": "human-readable description of the status of this operation"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "reason": {
                        "type": "string",
                        "description": "short"
                    },
                    "source": {
                        "$ref": "#/definitions/kubernetes_EventSource",
                        "javaType": "io.fabric8.kubernetes.api.model.EventSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Event",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_EventList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of events",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Event",
                            "javaType": "io.fabric8.kubernetes.api.model.Event"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "EventList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EventList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_EventSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "component": {
                        "type": "string",
                        "description": "component that generated the event"
                    },
                    "host": {
                        "type": "string",
                        "description": "name of the host where the event is generated"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.EventSource"
            },
            "kubernetes_ExecAction": {
                "type": "object",
                "description": "",
                "properties": {
                    "command": {
                        "type": "array",
                        "description": "command line to execute inside the container; working directory for the command is root ('/') in the container's file system; the command is exec'd",
                        "items": {
                            "type": "string",
                            "description": "command line to execute inside the container; working directory for the command is root ('/') in the container's file system; the command is exec'd"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ExecAction"
            },
            "kubernetes_GCEPersistentDiskVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "fsType": {
                        "type": "string",
                        "description": "file system type to mount"
                    },
                    "partition": {
                        "type": "integer",
                        "description": "partition on the disk to mount (e.g."
                    },
                    "pdName": {
                        "type": "string",
                        "description": "unique name of the PD resource in GCE; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#gcepersistentdisk"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "read-only if true"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.GCEPersistentDiskVolumeSource"
            },
            "kubernetes_GitRepoVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "repository URL"
                    },
                    "revision": {
                        "type": "string",
                        "description": "commit hash for the specified revision"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.GitRepoVolumeSource"
            },
            "kubernetes_GlusterfsVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "endpoints": {
                        "type": "string",
                        "description": "gluster hosts endpoints name; see http://releases.k8s.io/HEAD/examples/glusterfs/README.md#create-a-pod"
                    },
                    "path": {
                        "type": "string",
                        "description": "path to gluster volume; see http://releases.k8s.io/HEAD/examples/glusterfs/README.md#create-a-pod"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "glusterfs volume to be mounted with read-only permissions; see http://releases.k8s.io/HEAD/examples/glusterfs/README.md#create-a-pod"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.GlusterfsVolumeSource"
            },
            "kubernetes_HTTPGetAction": {
                "type": "object",
                "description": "",
                "properties": {
                    "host": {
                        "type": "string",
                        "description": "hostname to connect to; defaults to pod IP"
                    },
                    "path": {
                        "type": "string",
                        "description": "path to access on the HTTP server"
                    },
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.IntOrString"
                    },
                    "scheme": {
                        "type": "string",
                        "description": "scheme to connect with"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.HTTPGetAction"
            },
            "kubernetes_Handler": {
                "type": "object",
                "description": "",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.HTTPGetAction"
                    },
                    "tcpSocket": {
                        "$ref": "#/definitions/kubernetes_TCPSocketAction",
                        "javaType": "io.fabric8.kubernetes.api.model.TCPSocketAction"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Handler"
            },
            "kubernetes_HostPathVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "path of the directory on the host; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#hostpath"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.HostPathVolumeSource"
            },
            "kubernetes_ISCSIVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "fsType": {
                        "type": "string",
                        "description": "file system type to mount"
                    },
                    "iqn": {
                        "type": "string",
                        "description": "iSCSI Qualified Name"
                    },
                    "lun": {
                        "type": "integer",
                        "description": "iscsi target lun number"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "read-only if true"
                    },
                    "targetPortal": {
                        "type": "string",
                        "description": "iSCSI target portal"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ISCSIVolumeSource"
            },
            "kubernetes_Lifecycle": {
                "type": "object",
                "description": "",
                "properties": {
                    "postStart": {
                        "$ref": "#/definitions/kubernetes_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.Handler"
                    },
                    "preStop": {
                        "$ref": "#/definitions/kubernetes_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.Handler"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Lifecycle"
            },
            "kubernetes_List": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of objects",
                        "items": {
                            "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "List",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.BaseKubernetesList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_ListMeta": {
                "type": "object",
                "description": "",
                "properties": {
                    "resourceVersion": {
                        "type": "string",
                        "description": "string that identifies the internal version of this object that can be used by clients to determine when objects have changed; populated by the system"
                    },
                    "selfLink": {
                        "type": "string",
                        "description": "URL for the object; populated by the system"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
            },
            "kubernetes_LoadBalancerIngress": {
                "type": "object",
                "description": "",
                "properties": {
                    "hostname": {
                        "type": "string",
                        "description": "hostname of ingress point"
                    },
                    "ip": {
                        "type": "string",
                        "description": "IP address of ingress point"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.LoadBalancerIngress"
            },
            "kubernetes_LoadBalancerStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "ingress": {
                        "type": "array",
                        "description": "load-balancer ingress points",
                        "items": {
                            "$ref": "#/definitions/kubernetes_LoadBalancerIngress",
                            "javaType": "io.fabric8.kubernetes.api.model.LoadBalancerIngress"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.LoadBalancerStatus"
            },
            "kubernetes_LocalObjectReference": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the referent; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#names"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
            },
            "kubernetes_MetadataFile": {
                "type": "object",
                "description": "",
                "properties": {
                    "fieldRef": {
                        "$ref": "#/definitions/kubernetes_ObjectFieldSelector",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectFieldSelector"
                    },
                    "name": {
                        "type": "string",
                        "description": "the name of the file to be created"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.MetadataFile"
            },
            "kubernetes_MetadataVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "items": {
                        "type": "array",
                        "description": "list of metadata files",
                        "items": {
                            "$ref": "#/definitions/kubernetes_MetadataFile",
                            "javaType": "io.fabric8.kubernetes.api.model.MetadataFile"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.MetadataVolumeSource"
            },
            "kubernetes_NFSVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "the path that is exported by the NFS server; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#nfs"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "forces the NFS export to be mounted with read-only permissions; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#nfs"
                    },
                    "server": {
                        "type": "string",
                        "description": "the hostname or IP address of the NFS server; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#nfs"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NFSVolumeSource"
            },
            "kubernetes_Namespace": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Namespace",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_NamespaceSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.NamespaceSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_NamespaceStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.NamespaceStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Namespace",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_NamespaceList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "items is the list of Namespace objects in the list; see http://releases.k8s.io/HEAD/docs/user-guide/namespaces.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Namespace",
                            "javaType": "io.fabric8.kubernetes.api.model.Namespace"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "NamespaceList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamespaceList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_NamespaceSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "finalizers": {
                        "type": "array",
                        "description": "an opaque list of values that must be empty to permanently remove object from storage; see http://releases.k8s.io/HEAD/docs/design/namespaces.md#finalizers",
                        "items": {
                            "type": "string",
                            "description": "an opaque list of values that must be empty to permanently remove object from storage; see http://releases.k8s.io/HEAD/docs/design/namespaces.md#finalizers"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamespaceSpec"
            },
            "kubernetes_NamespaceStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "phase": {
                        "type": "string",
                        "description": "phase is the current lifecycle phase of the namespace; see http://releases.k8s.io/HEAD/docs/design/namespaces.md#phases"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamespaceStatus"
            },
            "kubernetes_Node": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Node",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_NodeSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.NodeSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_NodeStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.NodeStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Node",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_NodeAddress": {
                "type": "object",
                "description": "",
                "properties": {
                    "address": {
                        "type": "string",
                        "description": "the node address"
                    },
                    "type": {
                        "type": "string",
                        "description": "node address type"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeAddress"
            },
            "kubernetes_NodeCondition": {
                "type": "object",
                "description": "",
                "properties": {
                    "lastHeartbeatTime": {
                        "type": "string",
                        "description": "last time we got an update on a given condition"
                    },
                    "lastTransitionTime": {
                        "type": "string",
                        "description": "last time the condition transit from one status to another"
                    },
                    "message": {
                        "type": "string",
                        "description": "human readable message indicating details about last transition"
                    },
                    "reason": {
                        "type": "string",
                        "description": "(brief) reason for the condition's last transition"
                    },
                    "status": {
                        "type": "string",
                        "description": "status of the condition"
                    },
                    "type": {
                        "type": "string",
                        "description": "type of node condition"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeCondition"
            },
            "kubernetes_NodeList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of nodes",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Node",
                            "javaType": "io.fabric8.kubernetes.api.model.Node"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "NodeList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_NodeSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "externalID": {
                        "type": "string",
                        "description": "deprecated. External ID assigned to the node by some machine database (e.g. a cloud provider). Defaults to node name when empty."
                    },
                    "podCIDR": {
                        "type": "string",
                        "description": "pod IP range assigned to the node"
                    },
                    "providerID": {
                        "type": "string",
                        "description": "ID of the node assigned by the cloud provider in the format: \u003cProviderName\u003e://\u003cProviderSpecificNodeID\u003e"
                    },
                    "unschedulable": {
                        "type": "boolean",
                        "description": "disable pod scheduling on the node; see http://releases.k8s.io/HEAD/docs/admin/node.md#manual-node-administration"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeSpec"
            },
            "kubernetes_NodeStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "addresses": {
                        "type": "array",
                        "description": "list of addresses reachable to the node; see http://releases.k8s.io/HEAD/docs/admin/node.md#node-addresses",
                        "items": {
                            "$ref": "#/definitions/kubernetes_NodeAddress",
                            "javaType": "io.fabric8.kubernetes.api.model.NodeAddress"
                        }
                    },
                    "capacity": {
                        "type": "object",
                        "description": "compute resource capacity of the node; see http://releases.k8s.io/HEAD/docs/user-guide/compute-resources.md",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    },
                    "conditions": {
                        "type": "array",
                        "description": "list of node conditions observed; see http://releases.k8s.io/HEAD/docs/admin/node.md#node-condition",
                        "items": {
                            "$ref": "#/definitions/kubernetes_NodeCondition",
                            "javaType": "io.fabric8.kubernetes.api.model.NodeCondition"
                        }
                    },
                    "nodeInfo": {
                        "$ref": "#/definitions/kubernetes_NodeSystemInfo",
                        "javaType": "io.fabric8.kubernetes.api.model.NodeSystemInfo"
                    },
                    "phase": {
                        "type": "string",
                        "description": "most recently observed lifecycle phase of the node; see http://releases.k8s.io/HEAD/docs/admin/node.md#node-phase"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeStatus"
            },
            "kubernetes_NodeSystemInfo": {
                "type": "object",
                "description": "",
                "properties": {
                    "bootID": {
                        "type": "string",
                        "description": "boot id is the boot-id reported by the node"
                    },
                    "containerRuntimeVersion": {
                        "type": "string",
                        "description": "Container runtime version reported by the node through runtime remote API (e.g. docker://1.5.0)"
                    },
                    "kernelVersion": {
                        "type": "string",
                        "description": "Kernel version reported by the node from 'uname -r' (e.g. 3.16.0-0.bpo.4-amd64)"
                    },
                    "kubeProxyVersion": {
                        "type": "string",
                        "description": "Kube-proxy version reported by the node"
                    },
                    "kubeletVersion": {
                        "type": "string",
                        "description": "Kubelet version reported by the node"
                    },
                    "machineID": {
                        "type": "string",
                        "description": "machine-id reported by the node"
                    },
                    "osImage": {
                        "type": "string",
                        "description": "OS image used reported by the node from /etc/os-release (e.g. Debian GNU/Linux 7 (wheezy))"
                    },
                    "systemUUID": {
                        "type": "string",
                        "description": "system-uuid reported by the node"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NodeSystemInfo"
            },
            "kubernetes_ObjectFieldSelector": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "version of the schema that fieldPath is written in terms of; defaults to v1"
                    },
                    "fieldPath": {
                        "type": "string",
                        "description": "path of the field to select in the specified API version"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ObjectFieldSelector"
            },
            "kubernetes_ObjectMeta": {
                "type": "object",
                "description": "",
                "properties": {
                    "annotations": {
                        "type": "object",
                        "description": "map of string keys and values that can be used by external tooling to store and retrieve arbitrary metadata about objects; see http://releases.k8s.io/HEAD/docs/user-guide/annotations.md",
                        "additionalProperties": {
                            "type": "string",
                            "description": "map of string keys and values that can be used by external tooling to store and retrieve arbitrary metadata about objects; see http://releases.k8s.io/HEAD/docs/user-guide/annotations.md"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "creationTimestamp": {
                        "type": "string",
                        "description": "RFC 3339 date and time at which the object was created; populated by the system"
                    },
                    "deletionTimestamp": {
                        "type": "string",
                        "description": "RFC 3339 date and time at which the object will be deleted; populated by the system when a graceful deletion is requested"
                    },
                    "generateName": {
                        "type": "string",
                        "description": "an optional prefix to use to generate a unique name; has the same validation rules as name; optional"
                    },
                    "generation": {
                        "type": "integer",
                        "description": "a sequence number representing a specific generation of the desired state; populated by the system; read-only",
                        "javaType": "Long"
                    },
                    "labels": {
                        "type": "object",
                        "description": "map of string keys and values that can be used to organize and categorize objects; may match selectors of replication controllers and services; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md",
                        "additionalProperties": {
                            "type": "string",
                            "description": "map of string keys and values that can be used to organize and categorize objects; may match selectors of replication controllers and services; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "name": {
                        "type": "string",
                        "description": "string that identifies an object. Must be unique within a namespace; cannot be updated; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#names",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "namespace": {
                        "type": "string",
                        "description": "namespace of the object; must be a DNS_LABEL; cannot be updated; see http://releases.k8s.io/HEAD/docs/user-guide/namespaces.md",
                        "maxLength": 253,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$"
                    },
                    "resourceVersion": {
                        "type": "string",
                        "description": "string that identifies the internal version of this object that can be used by clients to determine when objects have changed; populated by the system"
                    },
                    "selfLink": {
                        "type": "string",
                        "description": "URL for the object; populated by the system"
                    },
                    "uid": {
                        "type": "string",
                        "description": "unique UUID across space and time; populated by the system; read-only; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#uids"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
            },
            "kubernetes_ObjectReference": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "API version of the referent"
                    },
                    "fieldPath": {
                        "type": "string",
                        "description": "if referring to a piece of an object instead of an entire object"
                    },
                    "kind": {
                        "type": "string",
                        "description": "kind of the referent; see http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#types-kinds"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the referent; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#names"
                    },
                    "namespace": {
                        "type": "string",
                        "description": "namespace of the referent; see http://releases.k8s.io/HEAD/docs/user-guide/namespaces.md"
                    },
                    "resourceVersion": {
                        "type": "string",
                        "description": "specific resourceVersion to which this reference is made"
                    },
                    "uid": {
                        "type": "string",
                        "description": "uid of the referent; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#uids"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
            },
            "kubernetes_PersistentVolume": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PersistentVolume",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolume",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_PersistentVolumeClaim": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PersistentVolumeClaim",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeClaimSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeClaimStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaim",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_PersistentVolumeClaimList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "a list of persistent volume claims; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#persistentvolumeclaims",
                        "items": {
                            "$ref": "#/definitions/kubernetes_PersistentVolumeClaim",
                            "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaim"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PersistentVolumeClaimList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_PersistentVolumeClaimSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "accessModes": {
                        "type": "array",
                        "description": "the desired access modes the volume should have; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes-1",
                        "items": {
                            "type": "string",
                            "description": "the desired access modes the volume should have; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes-1"
                        }
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_ResourceRequirements",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
                    },
                    "volumeName": {
                        "type": "string",
                        "description": "the binding reference to the persistent volume backing this claim"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimSpec"
            },
            "kubernetes_PersistentVolumeClaimStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "accessModes": {
                        "type": "array",
                        "description": "the actual access modes the volume has; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes-1",
                        "items": {
                            "type": "string",
                            "description": "the actual access modes the volume has; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes-1"
                        }
                    },
                    "capacity": {
                        "type": "object",
                        "description": "the actual resources the volume has",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    },
                    "phase": {
                        "type": "string",
                        "description": "the current phase of the claim"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimStatus"
            },
            "kubernetes_PersistentVolumeClaimVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "claimName": {
                        "type": "string",
                        "description": "the name of the claim in the same namespace to be mounted as a volume; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#persistentvolumeclaims"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "mount volume as read-only when true; default false"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimVolumeSource"
            },
            "kubernetes_PersistentVolumeList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of persistent volumes; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_PersistentVolume",
                            "javaType": "io.fabric8.kubernetes.api.model.PersistentVolume"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PersistentVolumeList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_PersistentVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": "#/definitions/kubernetes_AWSElasticBlockStoreVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.AWSElasticBlockStoreVolumeSource"
                    },
                    "cephfs": {
                        "$ref": "#/definitions/kubernetes_CephFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.CephFSVolumeSource"
                    },
                    "gcePersistentDisk": {
                        "$ref": "#/definitions/kubernetes_GCEPersistentDiskVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GCEPersistentDiskVolumeSource"
                    },
                    "glusterfs": {
                        "$ref": "#/definitions/kubernetes_GlusterfsVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GlusterfsVolumeSource"
                    },
                    "hostPath": {
                        "$ref": "#/definitions/kubernetes_HostPathVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.HostPathVolumeSource"
                    },
                    "iscsi": {
                        "$ref": "#/definitions/kubernetes_ISCSIVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.ISCSIVolumeSource"
                    },
                    "nfs": {
                        "$ref": "#/definitions/kubernetes_NFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.NFSVolumeSource"
                    },
                    "rbd": {
                        "$ref": "#/definitions/kubernetes_RBDVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.RBDVolumeSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeSource"
            },
            "kubernetes_PersistentVolumeSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "accessModes": {
                        "type": "array",
                        "description": "all ways the volume can be mounted; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes",
                        "items": {
                            "type": "string",
                            "description": "all ways the volume can be mounted; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#access-modes"
                        }
                    },
                    "awsElasticBlockStore": {
                        "$ref": "#/definitions/kubernetes_AWSElasticBlockStoreVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.AWSElasticBlockStoreVolumeSource"
                    },
                    "capacity": {
                        "type": "object",
                        "description": "a description of the persistent volume's resources and capacityr; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#capacity",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    },
                    "cephfs": {
                        "$ref": "#/definitions/kubernetes_CephFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.CephFSVolumeSource"
                    },
                    "claimRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "gcePersistentDisk": {
                        "$ref": "#/definitions/kubernetes_GCEPersistentDiskVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GCEPersistentDiskVolumeSource"
                    },
                    "glusterfs": {
                        "$ref": "#/definitions/kubernetes_GlusterfsVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GlusterfsVolumeSource"
                    },
                    "hostPath": {
                        "$ref": "#/definitions/kubernetes_HostPathVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.HostPathVolumeSource"
                    },
                    "iscsi": {
                        "$ref": "#/definitions/kubernetes_ISCSIVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.ISCSIVolumeSource"
                    },
                    "nfs": {
                        "$ref": "#/definitions/kubernetes_NFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.NFSVolumeSource"
                    },
                    "persistentVolumeReclaimPolicy": {
                        "type": "string",
                        "description": "what happens to a volume when released from its claim; Valid options are Retain (default) and Recycle.  Recyling must be supported by the volume plugin underlying this persistent volume. See http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#recycling-policy"
                    },
                    "rbd": {
                        "$ref": "#/definitions/kubernetes_RBDVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.RBDVolumeSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeSpec"
            },
            "kubernetes_PersistentVolumeStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "human-readable message indicating details about why the volume is in this state"
                    },
                    "phase": {
                        "type": "string",
                        "description": "the current phase of a persistent volume; see http://releases.k8s.io/HEAD/docs/user-guide/persistent-volumes.md#phase"
                    },
                    "reason": {
                        "type": "string",
                        "description": "(brief) reason the volume is not is not available"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeStatus"
            },
            "kubernetes_Pod": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Pod",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_PodSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PodSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_PodStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.PodStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Pod",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_PodCondition": {
                "type": "object",
                "description": "",
                "properties": {
                    "status": {
                        "type": "string",
                        "description": "status of the condition"
                    },
                    "type": {
                        "type": "string",
                        "description": "kind of the condition"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PodCondition"
            },
            "kubernetes_PodList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of pods; see http://releases.k8s.io/HEAD/docs/user-guide/pods.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Pod",
                            "javaType": "io.fabric8.kubernetes.api.model.Pod"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PodList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PodList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_PodSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "activeDeadlineSeconds": {
                        "type": "integer",
                        "description": "",
                        "javaType": "Long"
                    },
                    "containers": {
                        "type": "array",
                        "description": "list of containers belonging to the pod; cannot be updated; containers cannot currently be added or removed; there must be at least one container in a Pod; see http://releases.k8s.io/HEAD/docs/user-guide/containers.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Container",
                            "javaType": "io.fabric8.kubernetes.api.model.Container"
                        }
                    },
                    "dnsPolicy": {
                        "type": "string",
                        "description": "DNS policy for containers within the pod; one of 'ClusterFirst' or 'Default'"
                    },
                    "host": {
                        "type": "string",
                        "description": "deprecated"
                    },
                    "hostNetwork": {
                        "type": "boolean",
                        "description": "host networking requested for this pod"
                    },
                    "imagePullSecrets": {
                        "type": "array",
                        "description": "list of references to secrets in the same namespace available for pulling the container images; see http://releases.k8s.io/HEAD/docs/user-guide/images.md#specifying-imagepullsecrets-on-a-pod",
                        "items": {
                            "$ref": "#/definitions/kubernetes_LocalObjectReference",
                            "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                        }
                    },
                    "nodeName": {
                        "type": "string",
                        "description": "node requested for this pod"
                    },
                    "nodeSelector": {
                        "type": "object",
                        "description": "selector which must match a node's labels for the pod to be scheduled on that node; see http://releases.k8s.io/HEAD/docs/user-guide/node-selection/README.md",
                        "additionalProperties": {
                            "type": "string",
                            "description": "selector which must match a node's labels for the pod to be scheduled on that node; see http://releases.k8s.io/HEAD/docs/user-guide/node-selection/README.md"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "restartPolicy": {
                        "type": "string",
                        "description": "restart policy for all containers within the pod; one of Always"
                    },
                    "serviceAccount": {
                        "type": "string",
                        "description": "deprecated; use serviceAccountName instead"
                    },
                    "serviceAccountName": {
                        "type": "string",
                        "description": "name of the ServiceAccount to use to run this pod; see http://releases.k8s.io/HEAD/docs/design/service_accounts.md"
                    },
                    "terminationGracePeriodSeconds": {
                        "type": "integer",
                        "description": "optional duration in seconds the pod needs to terminate gracefully; may be decreased in delete request; value must be non-negative integer; the value zero indicates delete immediately; if this value is not set",
                        "javaType": "Long"
                    },
                    "volumes": {
                        "type": "array",
                        "description": "list of volumes that can be mounted by containers belonging to the pod; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Volume",
                            "javaType": "io.fabric8.kubernetes.api.model.Volume"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PodSpec"
            },
            "kubernetes_PodStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "conditions": {
                        "type": "array",
                        "description": "current service state of pod; see http://releases.k8s.io/HEAD/docs/user-guide/pod-states.md#pod-conditions",
                        "items": {
                            "$ref": "#/definitions/kubernetes_PodCondition",
                            "javaType": "io.fabric8.kubernetes.api.model.PodCondition"
                        }
                    },
                    "containerStatuses": {
                        "type": "array",
                        "description": "list of container statuses; see http://releases.k8s.io/HEAD/docs/user-guide/pod-states.md#container-statuses",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ContainerStatus",
                            "javaType": "io.fabric8.kubernetes.api.model.ContainerStatus"
                        }
                    },
                    "hostIP": {
                        "type": "string",
                        "description": "IP address of the host to which the pod is assigned; empty if not yet scheduled"
                    },
                    "message": {
                        "type": "string",
                        "description": "human readable message indicating details about why the pod is in this condition"
                    },
                    "phase": {
                        "type": "string",
                        "description": "current condition of the pod; see http://releases.k8s.io/HEAD/docs/user-guide/pod-states.md#pod-phase"
                    },
                    "podIP": {
                        "type": "string",
                        "description": "IP address allocated to the pod; routable at least within the cluster; empty if not yet allocated"
                    },
                    "reason": {
                        "type": "string",
                        "description": "(brief-CamelCase) reason indicating details about why the pod is in this condition"
                    },
                    "startTime": {
                        "type": "string",
                        "description": "RFC 3339 date and time at which the object was acknowledged by the Kubelet.  This is before the Kubelet pulled the container image(s) for the pod."
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PodStatus"
            },
            "kubernetes_PodTemplateSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_PodSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PodSpec"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.PodTemplateSpec"
            },
            "kubernetes_Probe": {
                "type": "object",
                "description": "",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.HTTPGetAction"
                    },
                    "initialDelaySeconds": {
                        "type": "integer",
                        "description": "number of seconds after the container has started before liveness probes are initiated; see http://releases.k8s.io/HEAD/docs/user-guide/pod-states.md#container-probes",
                        "javaType": "Long"
                    },
                    "tcpSocket": {
                        "$ref": "#/definitions/kubernetes_TCPSocketAction",
                        "javaType": "io.fabric8.kubernetes.api.model.TCPSocketAction"
                    },
                    "timeoutSeconds": {
                        "type": "integer",
                        "description": "number of seconds after which liveness probes timeout; defaults to 1 second; see http://releases.k8s.io/HEAD/docs/user-guide/pod-states.md#container-probes",
                        "javaType": "Long"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Probe"
            },
            "kubernetes_RBDVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "fsType": {
                        "type": "string",
                        "description": "file system type to mount"
                    },
                    "image": {
                        "type": "string",
                        "description": "rados image name; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                    },
                    "keyring": {
                        "type": "string",
                        "description": "keyring is the path to key ring for rados user; default is /etc/ceph/keyring; optional; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                    },
                    "monitors": {
                        "type": "array",
                        "description": "a collection of Ceph monitors; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it",
                        "items": {
                            "type": "string",
                            "description": "a collection of Ceph monitors; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                        }
                    },
                    "pool": {
                        "type": "string",
                        "description": "rados pool name; default is rbd; optional; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "rbd volume to be mounted with read-only permissions; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                    },
                    "secretRef": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    },
                    "user": {
                        "type": "string",
                        "description": "rados user name; default is admin; optional; see http://releases.k8s.io/HEAD/examples/rbd/README.md#how-to-use-it"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.RBDVolumeSource"
            },
            "kubernetes_ReplicationController": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ReplicationController",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_ReplicationControllerSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_ReplicationControllerStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ReplicationController",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_ReplicationControllerList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of replication controllers; see http://releases.k8s.io/HEAD/docs/user-guide/replication-controller.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ReplicationController",
                            "javaType": "io.fabric8.kubernetes.api.model.ReplicationController"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ReplicationControllerList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_ReplicationControllerSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "replicas": {
                        "type": "integer",
                        "description": "number of replicas desired; defaults to 1; see http://releases.k8s.io/HEAD/docs/user-guide/replication-controller.md#what-is-a-replication-controller"
                    },
                    "selector": {
                        "type": "object",
                        "description": "label keys and values that must match in order to be controlled by this replication controller",
                        "additionalProperties": {
                            "type": "string",
                            "description": "label keys and values that must match in order to be controlled by this replication controller"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "template": {
                        "$ref": "#/definitions/kubernetes_PodTemplateSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PodTemplateSpec"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerSpec"
            },
            "kubernetes_ReplicationControllerStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "observedGeneration": {
                        "type": "integer",
                        "description": "reflects the generation of the most recently observed replication controller",
                        "javaType": "Long"
                    },
                    "replicas": {
                        "type": "integer",
                        "description": "most recently oberved number of replicas; see http://releases.k8s.io/HEAD/docs/user-guide/replication-controller.md#what-is-a-replication-controller"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerStatus"
            },
            "kubernetes_ResourceQuota": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ResourceQuota",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_ResourceQuotaSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_ResourceQuotaStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuota",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_ResourceQuotaList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "items is a list of ResourceQuota objects; see http://releases.k8s.io/HEAD/docs/design/admission_control_resource_quota.md#admissioncontrol-plugin-resourcequota",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ResourceQuota",
                            "javaType": "io.fabric8.kubernetes.api.model.ResourceQuota"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ResourceQuotaList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_ResourceQuotaSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "hard": {
                        "type": "object",
                        "description": "hard is the set of desired hard limits for each named resource; see http://releases.k8s.io/HEAD/docs/design/admission_control_resource_quota.md#admissioncontrol-plugin-resourcequota",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaSpec"
            },
            "kubernetes_ResourceQuotaStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "hard": {
                        "type": "object",
                        "description": "hard is the set of enforced hard limits for each named resource; see http://releases.k8s.io/HEAD/docs/design/admission_control_resource_quota.md#admissioncontrol-plugin-resourcequota",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    },
                    "used": {
                        "type": "object",
                        "description": "used is the current observed total usage of the resource in the namespace",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaStatus"
            },
            "kubernetes_ResourceRequirements": {
                "type": "object",
                "description": "",
                "properties": {
                    "limits": {
                        "type": "object",
                        "description": "Maximum amount of compute resources allowed; see http://releases.k8s.io/HEAD/docs/design/resources.md#resource-specifications",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    },
                    "requests": {
                        "type": "object",
                        "description": "Minimum amount of resources requested; if Requests is omitted for a container",
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_resource_Quantity",
                            "javaType": "io.fabric8.kubernetes.api.model.Quantity"
                        },
                        "javaType": "java.util.Map\u003cString,io.fabric8.kubernetes.api.model.Quantity\u003e"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
            },
            "kubernetes_RunAsUserStrategyOptions": {
                "type": "object",
                "description": "",
                "properties": {
                    "type": {
                        "type": "string",
                        "description": "strategy used to generate RunAsUser"
                    },
                    "uid": {
                        "type": "integer",
                        "description": "the uid to always run as; required for MustRunAs",
                        "javaType": "Long"
                    },
                    "uidRangeMax": {
                        "type": "integer",
                        "description": "max value for range based allocators",
                        "javaType": "Long"
                    },
                    "uidRangeMin": {
                        "type": "integer",
                        "description": "min value for range based allocators",
                        "javaType": "Long"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.RunAsUserStrategyOptions"
            },
            "kubernetes_SELinuxContextStrategyOptions": {
                "type": "object",
                "description": "",
                "properties": {
                    "seLinuxOptions": {
                        "$ref": "#/definitions/kubernetes_SELinuxOptions",
                        "javaType": "io.fabric8.kubernetes.api.model.SELinuxOptions"
                    },
                    "type": {
                        "type": "string",
                        "description": "strategy used to generate the SELinux context"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SELinuxContextStrategyOptions"
            },
            "kubernetes_SELinuxOptions": {
                "type": "object",
                "description": "",
                "properties": {
                    "level": {
                        "type": "string",
                        "description": "the level label to apply to the container; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md"
                    },
                    "role": {
                        "type": "string",
                        "description": "the role label to apply to the container; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md"
                    },
                    "type": {
                        "type": "string",
                        "description": "the type label to apply to the container; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md"
                    },
                    "user": {
                        "type": "string",
                        "description": "the user label to apply to the container; see http://releases.k8s.io/HEAD/docs/user-guide/labels.md"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SELinuxOptions"
            },
            "kubernetes_Secret": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "data": {
                        "type": "object",
                        "description": "data contains the secret data.  Each key must be a valid DNS_SUBDOMAIN or leading dot followed by valid DNS_SUBDOMAIN.  Each value must be a base64 encoded string as described in https://tools.ietf.org/html/rfc4648#section-4",
                        "additionalProperties": {
                            "type": "string",
                            "description": "data contains the secret data.  Each key must be a valid DNS_SUBDOMAIN or leading dot followed by valid DNS_SUBDOMAIN.  Each value must be a base64 encoded string as described in https://tools.ietf.org/html/rfc4648#section-4"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Secret",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "type": {
                        "type": "string",
                        "description": "type facilitates programmatic handling of secret data"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Secret",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_SecretList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "items is a list of secret objects; see http://releases.k8s.io/HEAD/docs/user-guide/secrets.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Secret",
                            "javaType": "io.fabric8.kubernetes.api.model.Secret"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "SecretList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SecretList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_SecretVolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "secretName": {
                        "type": "string",
                        "description": "secretName is the name of a secret in the pod's namespace; see http://releases.k8s.io/HEAD/docs/user-guide/volumes.md#secrets"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SecretVolumeSource"
            },
            "kubernetes_SecurityContext": {
                "type": "object",
                "description": "",
                "properties": {
                    "capabilities": {
                        "$ref": "#/definitions/kubernetes_Capabilities",
                        "javaType": "io.fabric8.kubernetes.api.model.Capabilities"
                    },
                    "privileged": {
                        "type": "boolean",
                        "description": "run the container in privileged mode; see http://releases.k8s.io/HEAD/docs/design/security_context.md#security-context"
                    },
                    "runAsNonRoot": {
                        "type": "boolean",
                        "description": "indicates the container must be run as a non-root user either by specifying the runAsUser or in the image specification"
                    },
                    "runAsUser": {
                        "type": "integer",
                        "description": "the user id that runs the first process in the container; see http://releases.k8s.io/HEAD/docs/design/security_context.md#security-context",
                        "javaType": "Long"
                    },
                    "seLinuxOptions": {
                        "$ref": "#/definitions/kubernetes_SELinuxOptions",
                        "javaType": "io.fabric8.kubernetes.api.model.SELinuxOptions"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SecurityContext"
            },
            "kubernetes_SecurityContextConstraints": {
                "type": "object",
                "description": "",
                "properties": {
                    "allowHostDirVolumePlugin": {
                        "type": "boolean",
                        "description": "allow the use of the host dir volume plugin"
                    },
                    "allowHostNetwork": {
                        "type": "boolean",
                        "description": "allow the use of the hostNetwork in the pod spec"
                    },
                    "allowHostPorts": {
                        "type": "boolean",
                        "description": "allow the use of the host ports in the containers"
                    },
                    "allowPrivilegedContainer": {
                        "type": "boolean",
                        "description": "allow containers to run as privileged"
                    },
                    "allowedCapabilities": {
                        "type": "array",
                        "description": "capabilities that are allowed to be added",
                        "items": {
                            "type": "string",
                            "description": "capabilities that are allowed to be added"
                        }
                    },
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "groups": {
                        "type": "array",
                        "description": "groups allowed to use this SecurityContextConstraints",
                        "items": {
                            "type": "string",
                            "description": "groups allowed to use this SecurityContextConstraints"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "SecurityContextConstraints",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "runAsUser": {
                        "$ref": "#/definitions/kubernetes_RunAsUserStrategyOptions",
                        "javaType": "io.fabric8.kubernetes.api.model.RunAsUserStrategyOptions"
                    },
                    "seLinuxContext": {
                        "$ref": "#/definitions/kubernetes_SELinuxContextStrategyOptions",
                        "javaType": "io.fabric8.kubernetes.api.model.SELinuxContextStrategyOptions"
                    },
                    "users": {
                        "type": "array",
                        "description": "users allowed to use this SecurityContextConstraints",
                        "items": {
                            "type": "string",
                            "description": "users allowed to use this SecurityContextConstraints"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SecurityContextConstraints",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_SecurityContextConstraintsList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_SecurityContextConstraints",
                            "javaType": "io.fabric8.kubernetes.api.model.SecurityContextConstraints"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "SecurityContextConstraintsList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.SecurityContextConstraintsList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_Service": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Service",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_ServiceSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.ServiceSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_ServiceStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.ServiceStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Service",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_ServiceAccount": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "imagePullSecrets": {
                        "type": "array",
                        "description": "list of references to secrets in the same namespace available for pulling container images; see http://releases.k8s.io/HEAD/docs/user-guide/secrets.md#manually-specifying-an-imagepullsecret",
                        "items": {
                            "$ref": "#/definitions/kubernetes_LocalObjectReference",
                            "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ServiceAccount",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "secrets": {
                        "type": "array",
                        "description": "list of secrets that can be used by pods running as this service account; see http://releases.k8s.io/HEAD/docs/user-guide/secrets.md",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ObjectReference",
                            "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServiceAccount",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "kubernetes_ServiceAccountList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of ServiceAccounts; see http://releases.k8s.io/HEAD/docs/design/service_accounts.md#service-accounts",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ServiceAccount",
                            "javaType": "io.fabric8.kubernetes.api.model.ServiceAccount"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ServiceAccountList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServiceAccountList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_ServiceList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of services",
                        "items": {
                            "$ref": "#/definitions/kubernetes_Service",
                            "javaType": "io.fabric8.kubernetes.api.model.Service"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ServiceList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServiceList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "kubernetes_ServicePort": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "the name of this port; optional if only one port is defined",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "nodePort": {
                        "type": "integer",
                        "description": "the port on each node on which this service is exposed when type=NodePort or LoadBalancer; usually assigned by the system; if specified"
                    },
                    "port": {
                        "type": "integer",
                        "description": "the port number that is exposed"
                    },
                    "protocol": {
                        "type": "string",
                        "description": "the protocol used by this port; must be UDP or TCP; TCP if unspecified"
                    },
                    "targetPort": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.IntOrString"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServicePort"
            },
            "kubernetes_ServiceSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "clusterIP": {
                        "type": "string",
                        "description": "IP address of the service; usually assigned by the system; if specified"
                    },
                    "deprecatedPublicIPs": {
                        "type": "array",
                        "description": "deprecated. externally visible IPs (e.g. load balancers) that should be proxied to this service",
                        "items": {
                            "type": "string",
                            "description": "deprecated. externally visible IPs (e.g. load balancers) that should be proxied to this service"
                        }
                    },
                    "portalIP": {
                        "type": "string",
                        "description": "deprecated"
                    },
                    "ports": {
                        "type": "array",
                        "description": "ports exposed by the service; see http://releases.k8s.io/HEAD/docs/user-guide/services.md#virtual-ips-and-service-proxies",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ServicePort",
                            "javaType": "io.fabric8.kubernetes.api.model.ServicePort"
                        }
                    },
                    "selector": {
                        "type": "object",
                        "description": "label keys and values that must match in order to receive traffic for this service; if empty",
                        "additionalProperties": {
                            "type": "string",
                            "description": "label keys and values that must match in order to receive traffic for this service; if empty"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "sessionAffinity": {
                        "type": "string",
                        "description": "enable client IP based session affinity; must be ClientIP or None; defaults to None; see http://releases.k8s.io/HEAD/docs/user-guide/services.md#virtual-ips-and-service-proxies"
                    },
                    "type": {
                        "type": "string",
                        "description": "type of this service; must be ClusterIP"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServiceSpec"
            },
            "kubernetes_ServiceStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "loadBalancer": {
                        "$ref": "#/definitions/kubernetes_LoadBalancerStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.LoadBalancerStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.ServiceStatus"
            },
            "kubernetes_Status": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "code": {
                        "type": "integer",
                        "description": "suggested HTTP return code for this status; 0 if not set"
                    },
                    "details": {
                        "$ref": "#/definitions/kubernetes_StatusDetails",
                        "javaType": "io.fabric8.kubernetes.api.model.StatusDetails"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Status",
                        "required": true
                    },
                    "message": {
                        "type": "string",
                        "description": "human-readable description of the status of this operation"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    },
                    "reason": {
                        "type": "string",
                        "description": "machine-readable description of why this operation is in the 'Failure' status; if this value is empty there is no information available; a reason clarifies an HTTP status code but does not override it"
                    },
                    "status": {
                        "type": "string",
                        "description": "status of the operation; either Success"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Status"
            },
            "kubernetes_StatusCause": {
                "type": "object",
                "description": "",
                "properties": {
                    "field": {
                        "type": "string",
                        "description": "field of the resource that has caused this error"
                    },
                    "message": {
                        "type": "string",
                        "description": "human-readable description of the cause of the error; this field may be presented as-is to a reader"
                    },
                    "reason": {
                        "type": "string",
                        "description": "machine-readable description of the cause of the error; if this value is empty there is no information available"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.StatusCause"
            },
            "kubernetes_StatusDetails": {
                "type": "object",
                "description": "",
                "properties": {
                    "causes": {
                        "type": "array",
                        "description": "the Causes array includes more details associated with the StatusReason failure; not all StatusReasons may provide detailed causes",
                        "items": {
                            "$ref": "#/definitions/kubernetes_StatusCause",
                            "javaType": "io.fabric8.kubernetes.api.model.StatusCause"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "the kind attribute of the resource associated with the status StatusReason; on some operations may differ from the requested resource Kind; see http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#types-kinds"
                    },
                    "name": {
                        "type": "string",
                        "description": "the name attribute of the resource associated with the status StatusReason (when there is a single name which can be described)"
                    },
                    "retryAfterSeconds": {
                        "type": "integer",
                        "description": "the number of seconds before the client should attempt to retry this operation"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.StatusDetails"
            },
            "kubernetes_TCPSocketAction": {
                "type": "object",
                "description": "",
                "properties": {
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.IntOrString"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.TCPSocketAction"
            },
            "kubernetes_TypeMeta": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "version of the schema the object should have; see http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#resources"
                    },
                    "kind": {
                        "type": "string",
                        "description": "kind of object"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.TypeMeta"
            },
            "kubernetes_Volume": {
                "type": "object",
                "description": "",
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": "#/definitions/kubernetes_AWSElasticBlockStoreVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.AWSElasticBlockStoreVolumeSource"
                    },
                    "cephfs": {
                        "$ref": "#/definitions/kubernetes_CephFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.CephFSVolumeSource"
                    },
                    "emptyDir": {
                        "$ref": "#/definitions/kubernetes_EmptyDirVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.EmptyDirVolumeSource"
                    },
                    "gcePersistentDisk": {
                        "$ref": "#/definitions/kubernetes_GCEPersistentDiskVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GCEPersistentDiskVolumeSource"
                    },
                    "gitRepo": {
                        "$ref": "#/definitions/kubernetes_GitRepoVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GitRepoVolumeSource"
                    },
                    "glusterfs": {
                        "$ref": "#/definitions/kubernetes_GlusterfsVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GlusterfsVolumeSource"
                    },
                    "hostPath": {
                        "$ref": "#/definitions/kubernetes_HostPathVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.HostPathVolumeSource"
                    },
                    "iscsi": {
                        "$ref": "#/definitions/kubernetes_ISCSIVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.ISCSIVolumeSource"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_MetadataVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.MetadataVolumeSource"
                    },
                    "name": {
                        "type": "string",
                        "description": "volume name; must be a DNS_LABEL and unique within the pod; see http://releases.k8s.io/HEAD/docs/user-guide/identifiers.md#names",
                        "maxLength": 63,
                        "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"
                    },
                    "nfs": {
                        "$ref": "#/definitions/kubernetes_NFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.NFSVolumeSource"
                    },
                    "persistentVolumeClaim": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeClaimVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimVolumeSource"
                    },
                    "rbd": {
                        "$ref": "#/definitions/kubernetes_RBDVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.RBDVolumeSource"
                    },
                    "secret": {
                        "$ref": "#/definitions/kubernetes_SecretVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.SecretVolumeSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Volume"
            },
            "kubernetes_VolumeMount": {
                "type": "object",
                "description": "",
                "properties": {
                    "mountPath": {
                        "type": "string",
                        "description": "path within the container at which the volume should be mounted"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the volume to mount"
                    },
                    "readOnly": {
                        "type": "boolean",
                        "description": "mounted read-only if true"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.VolumeMount"
            },
            "kubernetes_VolumeSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": "#/definitions/kubernetes_AWSElasticBlockStoreVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.AWSElasticBlockStoreVolumeSource"
                    },
                    "cephfs": {
                        "$ref": "#/definitions/kubernetes_CephFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.CephFSVolumeSource"
                    },
                    "emptyDir": {
                        "$ref": "#/definitions/kubernetes_EmptyDirVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.EmptyDirVolumeSource"
                    },
                    "gcePersistentDisk": {
                        "$ref": "#/definitions/kubernetes_GCEPersistentDiskVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GCEPersistentDiskVolumeSource"
                    },
                    "gitRepo": {
                        "$ref": "#/definitions/kubernetes_GitRepoVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GitRepoVolumeSource"
                    },
                    "glusterfs": {
                        "$ref": "#/definitions/kubernetes_GlusterfsVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.GlusterfsVolumeSource"
                    },
                    "hostPath": {
                        "$ref": "#/definitions/kubernetes_HostPathVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.HostPathVolumeSource"
                    },
                    "iscsi": {
                        "$ref": "#/definitions/kubernetes_ISCSIVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.ISCSIVolumeSource"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_MetadataVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.MetadataVolumeSource"
                    },
                    "nfs": {
                        "$ref": "#/definitions/kubernetes_NFSVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.NFSVolumeSource"
                    },
                    "persistentVolumeClaim": {
                        "$ref": "#/definitions/kubernetes_PersistentVolumeClaimVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimVolumeSource"
                    },
                    "rbd": {
                        "$ref": "#/definitions/kubernetes_RBDVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.RBDVolumeSource"
                    },
                    "secret": {
                        "$ref": "#/definitions/kubernetes_SecretVolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.SecretVolumeSource"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.VolumeSource"
            },
            "kubernetes_config_AuthInfo": {
                "type": "object",
                "description": "",
                "properties": {
                    "client-certificate": {
                        "type": "string",
                        "description": ""
                    },
                    "client-certificate-data": {
                        "type": "string",
                        "description": ""
                    },
                    "client-key": {
                        "type": "string",
                        "description": ""
                    },
                    "client-key-data": {
                        "type": "string",
                        "description": ""
                    },
                    "extensions": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
                        }
                    },
                    "password": {
                        "type": "string",
                        "description": ""
                    },
                    "token": {
                        "type": "string",
                        "description": ""
                    },
                    "username": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.AuthInfo"
            },
            "kubernetes_config_Cluster": {
                "type": "object",
                "description": "",
                "properties": {
                    "api-version": {
                        "type": "string",
                        "description": ""
                    },
                    "certificate-authority": {
                        "type": "string",
                        "description": ""
                    },
                    "certificate-authority-data": {
                        "type": "string",
                        "description": ""
                    },
                    "extensions": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
                        }
                    },
                    "insecure-skip-tls-verify": {
                        "type": "boolean",
                        "description": ""
                    },
                    "server": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Cluster"
            },
            "kubernetes_config_Config": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": ""
                    },
                    "clusters": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedCluster",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedCluster"
                        }
                    },
                    "contexts": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedContext",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedContext"
                        }
                    },
                    "current-context": {
                        "type": "string",
                        "description": ""
                    },
                    "extensions": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": ""
                    },
                    "preferences": {
                        "$ref": "#/definitions/kubernetes_config_Preferences",
                        "javaType": "io.fabric8.kubernetes.api.model.Preferences"
                    },
                    "users": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedAuthInfo",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedAuthInfo"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Config"
            },
            "kubernetes_config_Context": {
                "type": "object",
                "description": "",
                "properties": {
                    "cluster": {
                        "type": "string",
                        "description": ""
                    },
                    "extensions": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
                        }
                    },
                    "namespace": {
                        "type": "string",
                        "description": ""
                    },
                    "user": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Context"
            },
            "kubernetes_config_NamedAuthInfo": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": ""
                    },
                    "user": {
                        "$ref": "#/definitions/kubernetes_config_AuthInfo",
                        "javaType": "io.fabric8.kubernetes.api.model.AuthInfo"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamedAuthInfo"
            },
            "kubernetes_config_NamedCluster": {
                "type": "object",
                "description": "",
                "properties": {
                    "cluster": {
                        "$ref": "#/definitions/kubernetes_config_Cluster",
                        "javaType": "io.fabric8.kubernetes.api.model.Cluster"
                    },
                    "name": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamedCluster"
            },
            "kubernetes_config_NamedContext": {
                "type": "object",
                "description": "",
                "properties": {
                    "context": {
                        "$ref": "#/definitions/kubernetes_config_Context",
                        "javaType": "io.fabric8.kubernetes.api.model.Context"
                    },
                    "name": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamedContext"
            },
            "kubernetes_config_NamedExtension": {
                "type": "object",
                "description": "",
                "properties": {
                    "extension": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "name": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
            },
            "kubernetes_config_Preferences": {
                "type": "object",
                "description": "",
                "properties": {
                    "colors": {
                        "type": "boolean",
                        "description": ""
                    },
                    "extensions": {
                        "type": "array",
                        "description": "",
                        "items": {
                            "$ref": "#/definitions/kubernetes_config_NamedExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.NamedExtension"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Preferences"
            },
            "kubernetes_resource_Quantity": {
                "type": "object",
                "description": "",
                "properties": {
                    "Amount": {
                        "$ref": "#/definitions/speter_inf_Dec",
                        "javaType": "io.fabric8.openshift.api.model.Dec"
                    },
                    "Format": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.Quantity"
            },
            "kubernetes_runtime_RawExtension": {
                "type": "object",
                "description": "",
                "properties": {
                    "RawJSON": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
            },
            "kubernetes_util_IntOrString": {
                "type": "object",
                "description": "",
                "properties": {
                    "IntVal": {
                        "type": "integer",
                        "description": ""
                    },
                    "Kind": {
                        "type": "integer",
                        "description": ""
                    },
                    "StrVal": {
                        "type": "string",
                        "description": ""
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.IntOrString"
            },
            "kubernetes_watch_WatchEvent": {
                "type": "object",
                "description": "",
                "properties": {
                    "object": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "type": {
                        "type": "string",
                        "description": "the type of watch event; may be ADDED"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.WatchEvent"
            },
            "os_authorization_AuthorizationAttributes": {
                "type": "object",
                "description": "",
                "properties": {
                    "content": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "namespace": {
                        "type": "string",
                        "description": "namespace of the action being requested"
                    },
                    "resource": {
                        "type": "string",
                        "description": "one of the existing resource types"
                    },
                    "resourceName": {
                        "type": "string",
                        "description": "name of the resource being requested for a get or delete"
                    },
                    "verb": {
                        "type": "string",
                        "description": "one of get"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.AuthorizationAttributes"
            },
            "os_authorization_ClusterPolicy": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterPolicy",
                        "required": true
                    },
                    "lastModified": {
                        "type": "string",
                        "description": "last time any part of the object was created"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "roles": {
                        "type": "array",
                        "description": "all the roles held by this policy",
                        "items": {
                            "$ref": "#/definitions/os_authorization_NamedClusterRole",
                            "javaType": "io.fabric8.openshift.api.model.NamedClusterRole"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicy",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_ClusterPolicyBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterPolicyBinding",
                        "required": true
                    },
                    "lastModified": {
                        "type": "string",
                        "description": "last time any part of the object was created"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "policyRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "roleBindings": {
                        "type": "array",
                        "description": "all the role bindings held by this policy",
                        "items": {
                            "$ref": "#/definitions/os_authorization_NamedClusterRoleBinding",
                            "javaType": "io.fabric8.openshift.api.model.NamedClusterRoleBinding"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyBinding",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_ClusterPolicyBindingList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of cluster policy bindings",
                        "items": {
                            "$ref": "#/definitions/os_authorization_ClusterPolicyBinding",
                            "javaType": "io.fabric8.openshift.api.model.ClusterPolicyBinding"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterPolicyBindingList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyBindingList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_ClusterPolicyList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of cluster policies",
                        "items": {
                            "$ref": "#/definitions/os_authorization_ClusterPolicy",
                            "javaType": "io.fabric8.openshift.api.model.ClusterPolicy"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterPolicyList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_ClusterRole": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterRole",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "rules": {
                        "type": "array",
                        "description": "list of policy rules",
                        "items": {
                            "$ref": "#/definitions/os_authorization_PolicyRule",
                            "javaType": "io.fabric8.openshift.api.model.PolicyRule"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterRole",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_ClusterRoleBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "groupNames": {
                        "type": "array",
                        "description": "all the groups directly bound to the role",
                        "items": {
                            "type": "string",
                            "description": "all the groups directly bound to the role"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterRoleBinding",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "roleRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "subjects": {
                        "type": "array",
                        "description": "references to subjects bound to the role.  Only User",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ObjectReference",
                            "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                        }
                    },
                    "userNames": {
                        "type": "array",
                        "description": "all user names directly bound to the role",
                        "items": {
                            "type": "string",
                            "description": "all user names directly bound to the role"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterRoleBinding",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_ClusterRoleBindingList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of cluster role bindings",
                        "items": {
                            "$ref": "#/definitions/os_authorization_ClusterRoleBinding",
                            "javaType": "io.fabric8.openshift.api.model.ClusterRoleBinding"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ClusterRoleBindingList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ClusterRoleBindingList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_LocalSubjectAccessReview": {
                "type": "object",
                "description": "",
                "properties": {
                    "TypeMeta": {
                        "$ref": "#/definitions/kubernetes_TypeMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.TypeMeta"
                    },
                    "content": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "groups": {
                        "type": "array",
                        "description": "optional",
                        "items": {
                            "type": "string",
                            "description": "optional"
                        }
                    },
                    "namespace": {
                        "type": "string",
                        "description": "namespace of the action being requested"
                    },
                    "resource": {
                        "type": "string",
                        "description": "one of the existing resource types"
                    },
                    "resourceName": {
                        "type": "string",
                        "description": "name of the resource being requested for a get or delete"
                    },
                    "user": {
                        "type": "string",
                        "description": "optional"
                    },
                    "verb": {
                        "type": "string",
                        "description": "one of get"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.LocalSubjectAccessReview"
            },
            "os_authorization_NamedClusterRole": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the cluster role"
                    },
                    "role": {
                        "$ref": "#/definitions/os_authorization_ClusterRole",
                        "javaType": "io.fabric8.openshift.api.model.ClusterRole"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedClusterRole"
            },
            "os_authorization_NamedClusterRoleBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the cluster role binding"
                    },
                    "roleBinding": {
                        "$ref": "#/definitions/os_authorization_ClusterRoleBinding",
                        "javaType": "io.fabric8.openshift.api.model.ClusterRoleBinding"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedClusterRoleBinding"
            },
            "os_authorization_NamedRole": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the role"
                    },
                    "role": {
                        "$ref": "#/definitions/os_authorization_Role",
                        "javaType": "io.fabric8.openshift.api.model.Role"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedRole"
            },
            "os_authorization_NamedRoleBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of the roleBinding"
                    },
                    "roleBinding": {
                        "$ref": "#/definitions/os_authorization_RoleBinding",
                        "javaType": "io.fabric8.openshift.api.model.RoleBinding"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedRoleBinding"
            },
            "os_authorization_Policy": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Policy",
                        "required": true
                    },
                    "lastModified": {
                        "type": "string",
                        "description": "last time that any part of the policy was created"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "roles": {
                        "type": "array",
                        "description": "roles held by this policy",
                        "items": {
                            "$ref": "#/definitions/os_authorization_NamedRole",
                            "javaType": "io.fabric8.openshift.api.model.NamedRole"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Policy",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_PolicyBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PolicyBinding",
                        "required": true
                    },
                    "lastModified": {
                        "type": "string",
                        "description": "last time that any part of the object was created"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "policyRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "roleBindings": {
                        "type": "array",
                        "description": "all roleBindings held by this policyBinding",
                        "items": {
                            "$ref": "#/definitions/os_authorization_NamedRoleBinding",
                            "javaType": "io.fabric8.openshift.api.model.NamedRoleBinding"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.PolicyBinding",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_PolicyBindingList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of policy bindings",
                        "items": {
                            "$ref": "#/definitions/os_authorization_PolicyBinding",
                            "javaType": "io.fabric8.openshift.api.model.PolicyBinding"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PolicyBindingList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.PolicyBindingList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_PolicyList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of policies",
                        "items": {
                            "$ref": "#/definitions/os_authorization_Policy",
                            "javaType": "io.fabric8.openshift.api.model.Policy"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "PolicyList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.PolicyList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_PolicyRule": {
                "type": "object",
                "description": "",
                "properties": {
                    "attributeRestrictions": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "nonResourceURLs": {
                        "type": "array",
                        "description": "set of partial urls that a user should have access to. *s are allowed",
                        "items": {
                            "type": "string",
                            "description": "set of partial urls that a user should have access to. *s are allowed"
                        }
                    },
                    "resourceNames": {
                        "type": "array",
                        "description": "optional white list of names that the rule applies to.  An empty set means that everything is allowed.",
                        "items": {
                            "type": "string",
                            "description": "optional white list of names that the rule applies to.  An empty set means that everything is allowed."
                        }
                    },
                    "resources": {
                        "type": "array",
                        "description": "list of resources this rule applies to.  * represents all resources.",
                        "items": {
                            "type": "string",
                            "description": "list of resources this rule applies to.  * represents all resources."
                        }
                    },
                    "verbs": {
                        "type": "array",
                        "description": "list of verbs that apply to ALL the resourceKinds and attributeRestrictions contained in this rule.  The verb * represents all kinds.",
                        "items": {
                            "type": "string",
                            "description": "list of verbs that apply to ALL the resourceKinds and attributeRestrictions contained in this rule.  The verb * represents all kinds."
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.PolicyRule"
            },
            "os_authorization_Role": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Role",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "rules": {
                        "type": "array",
                        "description": "all the rules for this role",
                        "items": {
                            "$ref": "#/definitions/os_authorization_PolicyRule",
                            "javaType": "io.fabric8.openshift.api.model.PolicyRule"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Role",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_RoleBinding": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "groupNames": {
                        "type": "array",
                        "description": "all the groups directly bound to the role",
                        "items": {
                            "type": "string",
                            "description": "all the groups directly bound to the role"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "RoleBinding",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "roleRef": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "subjects": {
                        "type": "array",
                        "description": "references to subjects bound to the role.  Only User",
                        "items": {
                            "$ref": "#/definitions/kubernetes_ObjectReference",
                            "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                        }
                    },
                    "userNames": {
                        "type": "array",
                        "description": "all the usernames directly bound to the role",
                        "items": {
                            "type": "string",
                            "description": "all the usernames directly bound to the role"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RoleBinding",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_authorization_RoleBindingList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of role bindings",
                        "items": {
                            "$ref": "#/definitions/os_authorization_RoleBinding",
                            "javaType": "io.fabric8.openshift.api.model.RoleBinding"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "RoleBindingList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RoleBindingList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_RoleList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of roles",
                        "items": {
                            "$ref": "#/definitions/os_authorization_Role",
                            "javaType": "io.fabric8.openshift.api.model.Role"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "RoleList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RoleList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_authorization_SubjectAccessReview": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "content": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "groups": {
                        "type": "array",
                        "description": "optional",
                        "items": {
                            "type": "string",
                            "description": "optional"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "SubjectAccessReview",
                        "required": true
                    },
                    "namespace": {
                        "type": "string",
                        "description": "namespace of the action being requested"
                    },
                    "resource": {
                        "type": "string",
                        "description": "one of the existing resource types"
                    },
                    "resourceName": {
                        "type": "string",
                        "description": "name of the resource being requested for a get or delete"
                    },
                    "user": {
                        "type": "string",
                        "description": "optional"
                    },
                    "verb": {
                        "type": "string",
                        "description": "one of get"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.SubjectAccessReview"
            },
            "os_authorization_SubjectAccessReviewResponse": {
                "type": "object",
                "description": "",
                "properties": {
                    "allowed": {
                        "type": "boolean",
                        "description": "true if the action would be allowed"
                    },
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "SubjectAccessReviewResponse",
                        "required": true
                    },
                    "namespace": {
                        "type": "string",
                        "description": "the namespace used for the access review"
                    },
                    "reason": {
                        "type": "string",
                        "description": "reason is optional"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.SubjectAccessReviewResponse"
            },
            "os_build_Build": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Build",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_build_BuildSpec",
                        "javaType": "io.fabric8.openshift.api.model.BuildSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_build_BuildStatus",
                        "javaType": "io.fabric8.openshift.api.model.BuildStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Build",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_build_BuildConfig": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "BuildConfig",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_build_BuildConfigSpec",
                        "javaType": "io.fabric8.openshift.api.model.BuildConfigSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_build_BuildConfigStatus",
                        "javaType": "io.fabric8.openshift.api.model.BuildConfigStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildConfig",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_build_BuildConfigList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of build configs",
                        "items": {
                            "$ref": "#/definitions/os_build_BuildConfig",
                            "javaType": "io.fabric8.openshift.api.model.BuildConfig"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "BuildConfigList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildConfigList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_build_BuildConfigSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "output": {
                        "$ref": "#/definitions/os_build_BuildOutput",
                        "javaType": "io.fabric8.openshift.api.model.BuildOutput"
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_ResourceRequirements",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
                    },
                    "revision": {
                        "$ref": "#/definitions/os_build_SourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.SourceRevision"
                    },
                    "serviceAccount": {
                        "type": "string",
                        "description": "the name of the service account to use to run pods created by the build"
                    },
                    "source": {
                        "$ref": "#/definitions/os_build_BuildSource",
                        "javaType": "io.fabric8.openshift.api.model.BuildSource"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_build_BuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.BuildStrategy"
                    },
                    "triggers": {
                        "type": "array",
                        "description": "determines how new builds can be launched from a build config.  if no triggers are defined",
                        "items": {
                            "$ref": "#/definitions/os_build_BuildTriggerPolicy",
                            "javaType": "io.fabric8.openshift.api.model.BuildTriggerPolicy"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildConfigSpec"
            },
            "os_build_BuildConfigStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "lastVersion": {
                        "type": "integer",
                        "description": "used to inform about number of last triggered build"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildConfigStatus"
            },
            "os_build_BuildList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of builds",
                        "items": {
                            "$ref": "#/definitions/os_build_Build",
                            "javaType": "io.fabric8.openshift.api.model.Build"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "BuildList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_build_BuildOutput": {
                "type": "object",
                "description": "",
                "properties": {
                    "pushSecret": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    },
                    "to": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildOutput"
            },
            "os_build_BuildRequest": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "BuildRequest",
                        "required": true
                    },
                    "lastVersion": {
                        "type": "integer",
                        "description": "LastVersion of the BuildConfig that triggered this build"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "revision": {
                        "$ref": "#/definitions/os_build_SourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.SourceRevision"
                    },
                    "triggeredByImage": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildRequest",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_build_BuildSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "contextDir": {
                        "type": "string",
                        "description": "specifies sub-directory where the source code for the application exists"
                    },
                    "git": {
                        "$ref": "#/definitions/os_build_GitBuildSource",
                        "javaType": "io.fabric8.openshift.api.model.GitBuildSource"
                    },
                    "sourceSecret": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    },
                    "type": {
                        "type": "string",
                        "description": "type of source control management system"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildSource"
            },
            "os_build_BuildSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "output": {
                        "$ref": "#/definitions/os_build_BuildOutput",
                        "javaType": "io.fabric8.openshift.api.model.BuildOutput"
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_ResourceRequirements",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
                    },
                    "revision": {
                        "$ref": "#/definitions/os_build_SourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.SourceRevision"
                    },
                    "serviceAccount": {
                        "type": "string",
                        "description": "the name of the service account to use to run pods created by the build"
                    },
                    "source": {
                        "$ref": "#/definitions/os_build_BuildSource",
                        "javaType": "io.fabric8.openshift.api.model.BuildSource"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_build_BuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.BuildStrategy"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildSpec"
            },
            "os_build_BuildStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "cancelled": {
                        "type": "boolean",
                        "description": "describes if a canceling event was triggered for the build"
                    },
                    "completionTimestamp": {
                        "type": "string",
                        "description": "server time when the pod running this build stopped running"
                    },
                    "config": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "duration": {
                        "type": "integer",
                        "description": "amount of time the build has been running",
                        "javaType": "Long"
                    },
                    "message": {
                        "type": "string",
                        "description": "human-readable message indicating details about why the build has this status"
                    },
                    "phase": {
                        "type": "string",
                        "description": "observed point in the build lifecycle"
                    },
                    "startTimestamp": {
                        "type": "string",
                        "description": "server time when this build started running in a pod"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildStatus"
            },
            "os_build_BuildStrategy": {
                "type": "object",
                "description": "",
                "properties": {
                    "customStrategy": {
                        "$ref": "#/definitions/os_build_CustomBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.CustomBuildStrategy"
                    },
                    "dockerStrategy": {
                        "$ref": "#/definitions/os_build_DockerBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.DockerBuildStrategy"
                    },
                    "sourceStrategy": {
                        "$ref": "#/definitions/os_build_SourceBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.SourceBuildStrategy"
                    },
                    "type": {
                        "type": "string",
                        "description": "identifies the type of build strategy"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildStrategy"
            },
            "os_build_BuildTriggerPolicy": {
                "type": "object",
                "description": "",
                "properties": {
                    "generic": {
                        "$ref": "#/definitions/os_build_WebHookTrigger",
                        "javaType": "io.fabric8.openshift.api.model.WebHookTrigger"
                    },
                    "github": {
                        "$ref": "#/definitions/os_build_WebHookTrigger",
                        "javaType": "io.fabric8.openshift.api.model.WebHookTrigger"
                    },
                    "imageChange": {
                        "$ref": "#/definitions/os_build_ImageChangeTrigger",
                        "javaType": "io.fabric8.openshift.api.model.ImageChangeTrigger"
                    },
                    "type": {
                        "type": "string",
                        "description": "type of build trigger"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.BuildTriggerPolicy"
            },
            "os_build_CustomBuildStrategy": {
                "type": "object",
                "description": "",
                "properties": {
                    "env": {
                        "type": "array",
                        "description": "additional environment variables you want to pass into a builder container",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    },
                    "exposeDockerSocket": {
                        "type": "boolean",
                        "description": "allow running Docker commands (and build Docker images) from inside the container"
                    },
                    "forcePull": {
                        "type": "boolean",
                        "description": "forces pulling of builder image from remote registry if true"
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "pullSecret": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.CustomBuildStrategy"
            },
            "os_build_DockerBuildStrategy": {
                "type": "object",
                "description": "",
                "properties": {
                    "env": {
                        "type": "array",
                        "description": "additional environment variables you want to pass into a builder container",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    },
                    "forcePull": {
                        "type": "boolean",
                        "description": "forces the source build to pull the image if true"
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "noCache": {
                        "type": "boolean",
                        "description": "if true"
                    },
                    "pullSecret": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DockerBuildStrategy"
            },
            "os_build_GitBuildSource": {
                "type": "object",
                "description": "",
                "properties": {
                    "httpProxy": {
                        "type": "string",
                        "description": "specifies a http proxy to be used during git clone operations"
                    },
                    "httpsProxy": {
                        "type": "string",
                        "description": "specifies a https proxy to be used during git clone operations"
                    },
                    "ref": {
                        "type": "string",
                        "description": "identifies the branch/tag/ref to build"
                    },
                    "uri": {
                        "type": "string",
                        "description": "points to the source that will be built"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.GitBuildSource"
            },
            "os_build_GitSourceRevision": {
                "type": "object",
                "description": "",
                "properties": {
                    "author": {
                        "$ref": "#/definitions/os_build_SourceControlUser",
                        "javaType": "io.fabric8.openshift.api.model.SourceControlUser"
                    },
                    "commit": {
                        "type": "string",
                        "description": "hash identifying a specific commit"
                    },
                    "committer": {
                        "$ref": "#/definitions/os_build_SourceControlUser",
                        "javaType": "io.fabric8.openshift.api.model.SourceControlUser"
                    },
                    "message": {
                        "type": "string",
                        "description": "description of a specific commit"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.GitSourceRevision"
            },
            "os_build_ImageChangeTrigger": {
                "type": "object",
                "description": "",
                "properties": {
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "lastTriggeredImageID": {
                        "type": "string",
                        "description": "used internally to save last used image ID for build"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageChangeTrigger"
            },
            "os_build_SourceBuildStrategy": {
                "type": "object",
                "description": "",
                "properties": {
                    "env": {
                        "type": "array",
                        "description": "additional environment variables you want to pass into a builder container",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    },
                    "forcePull": {
                        "type": "boolean",
                        "description": "forces the source build to pull the image if true"
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "incremental": {
                        "type": "boolean",
                        "description": "forces the source build to do incremental builds if true"
                    },
                    "pullSecret": {
                        "$ref": "#/definitions/kubernetes_LocalObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.LocalObjectReference"
                    },
                    "scripts": {
                        "type": "string",
                        "description": "location of the source scripts"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.SourceBuildStrategy"
            },
            "os_build_SourceControlUser": {
                "type": "object",
                "description": "",
                "properties": {
                    "email": {
                        "type": "string",
                        "description": "e-mail of the source control user"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the source control user"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.SourceControlUser"
            },
            "os_build_SourceRevision": {
                "type": "object",
                "description": "",
                "properties": {
                    "git": {
                        "$ref": "#/definitions/os_build_GitSourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.GitSourceRevision"
                    },
                    "type": {
                        "type": "string",
                        "description": "type of the build source"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.SourceRevision"
            },
            "os_build_WebHookTrigger": {
                "type": "object",
                "description": "",
                "properties": {
                    "secret": {
                        "type": "string",
                        "description": "secret used to validate requests"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.WebHookTrigger"
            },
            "os_deploy_CustomDeploymentStrategyParams": {
                "type": "object",
                "description": "",
                "properties": {
                    "command": {
                        "type": "array",
                        "description": "optionally overrides the container command (default is specified by the image)",
                        "items": {
                            "type": "string",
                            "description": "optionally overrides the container command (default is specified by the image)"
                        }
                    },
                    "environment": {
                        "type": "array",
                        "description": "environment variables provided to the deployment process container",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    },
                    "image": {
                        "type": "string",
                        "description": "a Docker image which can carry out a deployment"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.CustomDeploymentStrategyParams"
            },
            "os_deploy_DeploymentCause": {
                "type": "object",
                "description": "",
                "properties": {
                    "imageTrigger": {
                        "$ref": "#/definitions/os_deploy_DeploymentCauseImageTrigger",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentCauseImageTrigger"
                    },
                    "type": {
                        "type": "string",
                        "description": "the type of trigger that resulted in a new deployment"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentCause"
            },
            "os_deploy_DeploymentCauseImageTrigger": {
                "type": "object",
                "description": "",
                "properties": {
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentCauseImageTrigger"
            },
            "os_deploy_DeploymentConfig": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "DeploymentConfig",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_deploy_DeploymentConfigSpec",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentConfigSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_deploy_DeploymentConfigStatus",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentConfigStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentConfig",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_deploy_DeploymentConfigList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "a list of deployment configs",
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentConfig",
                            "javaType": "io.fabric8.openshift.api.model.DeploymentConfig"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "DeploymentConfigList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentConfigList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_deploy_DeploymentConfigSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "replicas": {
                        "type": "integer",
                        "description": "the desired number of replicas"
                    },
                    "selector": {
                        "type": "object",
                        "description": "a label query over pods that should match the replicas count",
                        "additionalProperties": {
                            "type": "string",
                            "description": "a label query over pods that should match the replicas count"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_deploy_DeploymentStrategy",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentStrategy"
                    },
                    "template": {
                        "$ref": "#/definitions/kubernetes_PodTemplateSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.PodTemplateSpec"
                    },
                    "triggers": {
                        "type": "array",
                        "description": "how new deployments are triggered",
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentTriggerPolicy",
                            "javaType": "io.fabric8.openshift.api.model.DeploymentTriggerPolicy"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentConfigSpec"
            },
            "os_deploy_DeploymentConfigStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "details": {
                        "$ref": "#/definitions/os_deploy_DeploymentDetails",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentDetails"
                    },
                    "latestVersion": {
                        "type": "integer",
                        "description": "used to determine whether the current deployment is out of sync"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentConfigStatus"
            },
            "os_deploy_DeploymentDetails": {
                "type": "object",
                "description": "",
                "properties": {
                    "causes": {
                        "type": "array",
                        "description": "extended data associated with all the causes for creating a new deployment",
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentCause",
                            "javaType": "io.fabric8.openshift.api.model.DeploymentCause"
                        }
                    },
                    "message": {
                        "type": "string",
                        "description": "a user specified change message"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentDetails"
            },
            "os_deploy_DeploymentStrategy": {
                "type": "object",
                "description": "",
                "properties": {
                    "customParams": {
                        "$ref": "#/definitions/os_deploy_CustomDeploymentStrategyParams",
                        "javaType": "io.fabric8.openshift.api.model.CustomDeploymentStrategyParams"
                    },
                    "recreateParams": {
                        "$ref": "#/definitions/os_deploy_RecreateDeploymentStrategyParams",
                        "javaType": "io.fabric8.openshift.api.model.RecreateDeploymentStrategyParams"
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_ResourceRequirements",
                        "javaType": "io.fabric8.kubernetes.api.model.ResourceRequirements"
                    },
                    "rollingParams": {
                        "$ref": "#/definitions/os_deploy_RollingDeploymentStrategyParams",
                        "javaType": "io.fabric8.openshift.api.model.RollingDeploymentStrategyParams"
                    },
                    "type": {
                        "type": "string",
                        "description": "the name of a deployment strategy"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentStrategy"
            },
            "os_deploy_DeploymentTriggerImageChangeParams": {
                "type": "object",
                "description": "",
                "properties": {
                    "automatic": {
                        "type": "boolean",
                        "description": "whether detection of a new tag value should trigger a deployment"
                    },
                    "containerNames": {
                        "type": "array",
                        "description": "restricts tag updates to a set of container names in the pod",
                        "items": {
                            "type": "string",
                            "description": "restricts tag updates to a set of container names in the pod"
                        }
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "lastTriggeredImage": {
                        "type": "string",
                        "description": "the last image to be triggered"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentTriggerImageChangeParams"
            },
            "os_deploy_DeploymentTriggerPolicy": {
                "type": "object",
                "description": "",
                "properties": {
                    "imageChangeParams": {
                        "$ref": "#/definitions/os_deploy_DeploymentTriggerImageChangeParams",
                        "javaType": "io.fabric8.openshift.api.model.DeploymentTriggerImageChangeParams"
                    },
                    "type": {
                        "type": "string",
                        "description": "the type of the trigger"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.DeploymentTriggerPolicy"
            },
            "os_deploy_ExecNewPodHook": {
                "type": "object",
                "description": "",
                "properties": {
                    "command": {
                        "type": "array",
                        "description": "the hook command and its arguments",
                        "items": {
                            "type": "string",
                            "description": "the hook command and its arguments"
                        }
                    },
                    "containerName": {
                        "type": "string",
                        "description": "the name of a container from the pod template whose image will be used for the hook container"
                    },
                    "env": {
                        "type": "array",
                        "description": "environment variables provided to the hook container",
                        "items": {
                            "$ref": "#/definitions/kubernetes_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ExecNewPodHook"
            },
            "os_deploy_LifecycleHook": {
                "type": "object",
                "description": "",
                "properties": {
                    "execNewPod": {
                        "$ref": "#/definitions/os_deploy_ExecNewPodHook",
                        "javaType": "io.fabric8.openshift.api.model.ExecNewPodHook"
                    },
                    "failurePolicy": {
                        "type": "string",
                        "description": "what action to take if the hook fails"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.LifecycleHook"
            },
            "os_deploy_RecreateDeploymentStrategyParams": {
                "type": "object",
                "description": "",
                "properties": {
                    "post": {
                        "$ref": "#/definitions/os_deploy_LifecycleHook",
                        "javaType": "io.fabric8.openshift.api.model.LifecycleHook"
                    },
                    "pre": {
                        "$ref": "#/definitions/os_deploy_LifecycleHook",
                        "javaType": "io.fabric8.openshift.api.model.LifecycleHook"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RecreateDeploymentStrategyParams"
            },
            "os_deploy_RollingDeploymentStrategyParams": {
                "type": "object",
                "description": "",
                "properties": {
                    "intervalSeconds": {
                        "type": "integer",
                        "description": "the time to wait between polling deployment status after update",
                        "javaType": "Long"
                    },
                    "post": {
                        "$ref": "#/definitions/os_deploy_LifecycleHook",
                        "javaType": "io.fabric8.openshift.api.model.LifecycleHook"
                    },
                    "pre": {
                        "$ref": "#/definitions/os_deploy_LifecycleHook",
                        "javaType": "io.fabric8.openshift.api.model.LifecycleHook"
                    },
                    "timeoutSeconds": {
                        "type": "integer",
                        "description": "the time to wait for updates before giving up",
                        "javaType": "Long"
                    },
                    "updatePercent": {
                        "type": "integer",
                        "description": "the percentage of replicas to scale up or down each interval (negative value switches scale order to down/up instead of up/down)"
                    },
                    "updatePeriodSeconds": {
                        "type": "integer",
                        "description": "the time to wait between individual pod updates",
                        "javaType": "Long"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RollingDeploymentStrategyParams"
            },
            "os_image_Image": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "dockerImageManifest": {
                        "type": "string",
                        "description": "raw JSON of the manifest"
                    },
                    "dockerImageMetadata": {
                        "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                        "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                    },
                    "dockerImageMetadataVersion": {
                        "type": "string",
                        "description": "conveys version of the object"
                    },
                    "dockerImageReference": {
                        "type": "string",
                        "description": "string that can be used to pull this image"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Image",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Image",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_image_ImageList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of image objects",
                        "items": {
                            "$ref": "#/definitions/os_image_Image",
                            "javaType": "io.fabric8.openshift.api.model.Image"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ImageList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_image_ImageStream": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ImageStream",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_image_ImageStreamSpec",
                        "javaType": "io.fabric8.openshift.api.model.ImageStreamSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_image_ImageStreamStatus",
                        "javaType": "io.fabric8.openshift.api.model.ImageStreamStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageStream",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_image_ImageStreamList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of image stream objects",
                        "items": {
                            "$ref": "#/definitions/os_image_ImageStream",
                            "javaType": "io.fabric8.openshift.api.model.ImageStream"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ImageStreamList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageStreamList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_image_ImageStreamSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "dockerImageRepository": {
                        "type": "string",
                        "description": "optional field if specified this stream is backed by a Docker repository on this server"
                    },
                    "tags": {
                        "type": "array",
                        "description": "map arbitrary string values to specific image locators",
                        "items": {
                            "$ref": "#/definitions/os_image_NamedTagReference",
                            "javaType": "io.fabric8.openshift.api.model.NamedTagReference"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageStreamSpec"
            },
            "os_image_ImageStreamStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "dockerImageRepository": {
                        "type": "string",
                        "description": "represents the effective location this stream may be accessed at"
                    },
                    "tags": {
                        "type": "array",
                        "description": "historical record of images associated with each tag",
                        "items": {
                            "$ref": "#/definitions/os_image_NamedTagEventList",
                            "javaType": "io.fabric8.openshift.api.model.NamedTagEventList"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ImageStreamStatus"
            },
            "os_image_NamedTagEventList": {
                "type": "object",
                "description": "",
                "properties": {
                    "items": {
                        "type": "array",
                        "description": "list of tag events related to the tag",
                        "items": {
                            "$ref": "#/definitions/os_image_TagEvent",
                            "javaType": "io.fabric8.openshift.api.model.TagEvent"
                        }
                    },
                    "tag": {
                        "type": "string",
                        "description": "the tag"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedTagEventList"
            },
            "os_image_NamedTagReference": {
                "type": "object",
                "description": "",
                "properties": {
                    "annotations": {
                        "type": "object",
                        "description": "annotations associated with images using this tag",
                        "additionalProperties": {
                            "type": "string",
                            "description": "annotations associated with images using this tag"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "from": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of tag"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.NamedTagReference"
            },
            "os_image_TagEvent": {
                "type": "object",
                "description": "",
                "properties": {
                    "created": {
                        "type": "string",
                        "description": "when the event was created"
                    },
                    "dockerImageReference": {
                        "type": "string",
                        "description": "the string that can be used to pull this image"
                    },
                    "image": {
                        "type": "string",
                        "description": "the image"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.TagEvent"
            },
            "os_oauth_OAuthAccessToken": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "authorizeToken": {
                        "type": "string",
                        "description": "contains the token that authorized this token"
                    },
                    "clientName": {
                        "type": "string",
                        "description": "references the client that created this token"
                    },
                    "expiresIn": {
                        "type": "integer",
                        "description": "is the seconds from creation time before this token expires",
                        "javaType": "Long"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthAccessToken",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "redirectURI": {
                        "type": "string",
                        "description": "redirection URI associated with the token"
                    },
                    "refreshToken": {
                        "type": "string",
                        "description": "optional value by which this token can be renewed"
                    },
                    "scopes": {
                        "type": "array",
                        "description": "list of requested scopes",
                        "items": {
                            "type": "string",
                            "description": "list of requested scopes"
                        }
                    },
                    "userName": {
                        "type": "string",
                        "description": "user name associated with this token"
                    },
                    "userUID": {
                        "type": "string",
                        "description": "unique UID associated with this token"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthAccessToken",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_oauth_OAuthAccessTokenList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of oauth access tokens",
                        "items": {
                            "$ref": "#/definitions/os_oauth_OAuthAccessToken",
                            "javaType": "io.fabric8.openshift.api.model.OAuthAccessToken"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthAccessTokenList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthAccessTokenList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_oauth_OAuthAuthorizeToken": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "clientName": {
                        "type": "string",
                        "description": "references the client that created this token"
                    },
                    "expiresIn": {
                        "type": "integer",
                        "description": "seconds from creation time before this token expires",
                        "javaType": "Long"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthAuthorizeToken",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "redirectURI": {
                        "type": "string",
                        "description": "redirection URI associated with the token"
                    },
                    "scopes": {
                        "type": "array",
                        "description": "list of requested scopes",
                        "items": {
                            "type": "string",
                            "description": "list of requested scopes"
                        }
                    },
                    "state": {
                        "type": "string",
                        "description": "state data from request"
                    },
                    "userName": {
                        "type": "string",
                        "description": "user name associated with this token"
                    },
                    "userUID": {
                        "type": "string",
                        "description": "unique UID associated with this token.  userUID and userName must both match for this token to be valid"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthAuthorizeToken",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_oauth_OAuthAuthorizeTokenList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of oauth authorization tokens",
                        "items": {
                            "$ref": "#/definitions/os_oauth_OAuthAuthorizeToken",
                            "javaType": "io.fabric8.openshift.api.model.OAuthAuthorizeToken"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthAuthorizeTokenList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthAuthorizeTokenList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_oauth_OAuthClient": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthClient",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "redirectURIs": {
                        "type": "array",
                        "description": "valid redirection URIs associated with a client",
                        "items": {
                            "type": "string",
                            "description": "valid redirection URIs associated with a client"
                        }
                    },
                    "respondWithChallenges": {
                        "type": "boolean",
                        "description": "indicates whether the client wants authentication needed responses made in the form of challenges instead of redirects"
                    },
                    "secret": {
                        "type": "string",
                        "description": "unique secret associated with a client"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthClient",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_oauth_OAuthClientAuthorization": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "clientName": {
                        "type": "string",
                        "description": "references the client that created this authorization"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthClientAuthorization",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "scopes": {
                        "type": "array",
                        "description": "list of granted scopes",
                        "items": {
                            "type": "string",
                            "description": "list of granted scopes"
                        }
                    },
                    "userName": {
                        "type": "string",
                        "description": "user name that authorized this client"
                    },
                    "userUID": {
                        "type": "string",
                        "description": "unique UID associated with this authorization. userUID and userName must both match for this authorization to be valid"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthClientAuthorization",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_oauth_OAuthClientAuthorizationList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of oauth client authorizations",
                        "items": {
                            "$ref": "#/definitions/os_oauth_OAuthClientAuthorization",
                            "javaType": "io.fabric8.openshift.api.model.OAuthClientAuthorization"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthClientAuthorizationList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthClientAuthorizationList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_oauth_OAuthClientList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of oauth clients",
                        "items": {
                            "$ref": "#/definitions/os_oauth_OAuthClient",
                            "javaType": "io.fabric8.openshift.api.model.OAuthClient"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "OAuthClientList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.OAuthClientList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_project_Project": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Project",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_project_ProjectSpec",
                        "javaType": "io.fabric8.openshift.api.model.ProjectSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_project_ProjectStatus",
                        "javaType": "io.fabric8.openshift.api.model.ProjectStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Project",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_project_ProjectList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of projects",
                        "items": {
                            "$ref": "#/definitions/os_project_Project",
                            "javaType": "io.fabric8.openshift.api.model.Project"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ProjectList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ProjectList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_project_ProjectRequest": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "description": {
                        "type": "string",
                        "description": "description to apply to a project"
                    },
                    "displayName": {
                        "type": "string",
                        "description": "display name to apply to a project"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "ProjectRequest",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ProjectRequest",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_project_ProjectSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "finalizers": {
                        "type": "array",
                        "description": "an opaque list of values that must be empty to permanently remove object from storage",
                        "items": {
                            "type": "string",
                            "description": "an opaque list of values that must be empty to permanently remove object from storage"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ProjectSpec"
            },
            "os_project_ProjectStatus": {
                "type": "object",
                "description": "",
                "properties": {
                    "phase": {
                        "type": "string",
                        "description": "phase is the current lifecycle phase of the project"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.ProjectStatus"
            },
            "os_route_Route": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Route",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "spec": {
                        "$ref": "#/definitions/os_route_RouteSpec",
                        "javaType": "io.fabric8.openshift.api.model.RouteSpec"
                    },
                    "status": {
                        "$ref": "#/definitions/os_route_RouteStatus",
                        "javaType": "io.fabric8.openshift.api.model.RouteStatus"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Route",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_route_RouteList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of routes",
                        "items": {
                            "$ref": "#/definitions/os_route_Route",
                            "javaType": "io.fabric8.openshift.api.model.Route"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "RouteList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RouteList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_route_RouteSpec": {
                "type": "object",
                "description": "",
                "properties": {
                    "host": {
                        "type": "string",
                        "description": "optional: alias/dns that points to the service"
                    },
                    "path": {
                        "type": "string",
                        "description": "optional: path that the router watches to route traffic to the service"
                    },
                    "tls": {
                        "$ref": "#/definitions/os_route_TLSConfig",
                        "javaType": "io.fabric8.openshift.api.model.TLSConfig"
                    },
                    "to": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RouteSpec"
            },
            "os_route_RouteStatus": {
                "type": "object",
                "description": "",
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.RouteStatus"
            },
            "os_route_TLSConfig": {
                "type": "object",
                "description": "",
                "properties": {
                    "caCertificate": {
                        "type": "string",
                        "description": "provides the cert authority certificate contents"
                    },
                    "certificate": {
                        "type": "string",
                        "description": "provides certificate contents"
                    },
                    "destinationCACertificate": {
                        "type": "string",
                        "description": "provides the contents of the ca certificate of the final destination.  When using re-encrypt termination this file should be provided in order to have routers use it for health checks on the secure connection"
                    },
                    "key": {
                        "type": "string",
                        "description": "provides key file contents"
                    },
                    "termination": {
                        "type": "string",
                        "description": "indicates termination type.  if not set"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.TLSConfig"
            },
            "os_template_Parameter": {
                "type": "object",
                "description": "",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "optional: describes the parameter"
                    },
                    "from": {
                        "type": "string",
                        "description": "input value for the generator"
                    },
                    "generate": {
                        "type": "string",
                        "description": "optional: generate specifies the generator to be used to generate random string from an input value specified by the from field.  the result string is stored in the value field. if not specified"
                    },
                    "name": {
                        "type": "string",
                        "description": "name of the parameter"
                    },
                    "required": {
                        "type": "boolean",
                        "description": "indicates the parameter must have a non-empty value or be generated"
                    },
                    "value": {
                        "type": "string",
                        "description": "optional: holds the parameter data.  if specified"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Parameter"
            },
            "os_template_Template": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Template",
                        "required": true
                    },
                    "labels": {
                        "type": "object",
                        "description": "optional: list of lables that are applied to every object during the template to config transformation",
                        "additionalProperties": {
                            "type": "string",
                            "description": "optional: list of lables that are applied to every object during the template to config transformation"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "objects": {
                        "type": "array",
                        "description": "list of objects to include in the template",
                        "items": {
                            "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.HasMetadata"
                        }
                    },
                    "parameters": {
                        "type": "array",
                        "description": "optional: list of parameters used during template to config transformation",
                        "items": {
                            "$ref": "#/definitions/os_template_Parameter",
                            "javaType": "io.fabric8.openshift.api.model.Parameter"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Template",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_template_TemplateList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of templates",
                        "items": {
                            "$ref": "#/definitions/os_template_Template",
                            "javaType": "io.fabric8.openshift.api.model.Template"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "TemplateList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.TemplateList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_user_Group": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Group",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "users": {
                        "type": "array",
                        "description": "list of users in this group",
                        "items": {
                            "type": "string",
                            "description": "list of users in this group"
                        }
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Group",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_user_GroupList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of groups",
                        "items": {
                            "$ref": "#/definitions/os_user_Group",
                            "javaType": "io.fabric8.openshift.api.model.Group"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "GroupList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.GroupList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_user_Identity": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "extra": {
                        "type": "object",
                        "description": "extra information for this identity",
                        "additionalProperties": {
                            "type": "string",
                            "description": "extra information for this identity"
                        },
                        "javaType": "java.util.Map\u003cString,String\u003e"
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "Identity",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    },
                    "providerName": {
                        "type": "string",
                        "description": "source of identity information"
                    },
                    "providerUserName": {
                        "type": "string",
                        "description": "uniquely represents this identity in the scope of the provider"
                    },
                    "user": {
                        "$ref": "#/definitions/kubernetes_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectReference"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Identity",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_user_IdentityList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of identities",
                        "items": {
                            "$ref": "#/definitions/os_user_Identity",
                            "javaType": "io.fabric8.openshift.api.model.Identity"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "IdentityList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.IdentityList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "os_user_User": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "fullName": {
                        "type": "string",
                        "description": "full name of user"
                    },
                    "groups": {
                        "type": "array",
                        "description": "list of groups",
                        "items": {
                            "type": "string",
                            "description": "list of groups"
                        }
                    },
                    "identities": {
                        "type": "array",
                        "description": "list of identities",
                        "items": {
                            "type": "string",
                            "description": "list of identities"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "User",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ObjectMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.User",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.HasMetadata"
                ]
            },
            "os_user_UserList": {
                "type": "object",
                "description": "",
                "properties": {
                    "apiVersion": {
                        "type": "string",
                        "description": "",
                        "default": "v1",
                        "required": true,
                        "enum": [
                            "v1"
                        ]
                    },
                    "items": {
                        "type": "array",
                        "description": "list of users",
                        "items": {
                            "$ref": "#/definitions/os_user_User",
                            "javaType": "io.fabric8.openshift.api.model.User"
                        }
                    },
                    "kind": {
                        "type": "string",
                        "description": "",
                        "default": "UserList",
                        "required": true
                    },
                    "metadata": {
                        "$ref": "#/definitions/kubernetes_ListMeta",
                        "javaType": "io.fabric8.kubernetes.api.model.ListMeta"
                    }
                },
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.UserList",
                "javaInterfaces": [
                    "io.fabric8.kubernetes.api.model.KubernetesResource",
                    "io.fabric8.kubernetes.api.model.KubernetesResourceList"
                ]
            },
            "speter_inf_Dec": {
                "type": "object",
                "description": "",
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.Dec"
            }
        },
        "type": "object",
        "properties": {
            "BaseKubernetesList": {
                "$ref": "#/definitions/kubernetes_List",
                "javaType": "io.fabric8.kubernetes.api.model.BaseKubernetesList"
            },
            "BuildConfigList": {
                "$ref": "#/definitions/os_build_BuildConfigList",
                "javaType": "io.fabric8.openshift.api.model.BuildConfigList"
            },
            "BuildList": {
                "$ref": "#/definitions/os_build_BuildList",
                "javaType": "io.fabric8.openshift.api.model.BuildList"
            },
            "BuildRequest": {
                "$ref": "#/definitions/os_build_BuildRequest",
                "javaType": "io.fabric8.openshift.api.model.BuildRequest"
            },
            "ClusterPolicy": {
                "$ref": "#/definitions/os_authorization_ClusterPolicy",
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicy"
            },
            "ClusterPolicyBinding": {
                "$ref": "#/definitions/os_authorization_ClusterPolicyBinding",
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyBinding"
            },
            "ClusterPolicyBindingList": {
                "$ref": "#/definitions/os_authorization_ClusterPolicyBindingList",
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyBindingList"
            },
            "ClusterPolicyList": {
                "$ref": "#/definitions/os_authorization_ClusterPolicyList",
                "javaType": "io.fabric8.openshift.api.model.ClusterPolicyList"
            },
            "ClusterRoleBinding": {
                "$ref": "#/definitions/os_authorization_ClusterRoleBinding",
                "javaType": "io.fabric8.openshift.api.model.ClusterRoleBinding"
            },
            "ClusterRoleBindingList": {
                "$ref": "#/definitions/os_authorization_ClusterRoleBindingList",
                "javaType": "io.fabric8.openshift.api.model.ClusterRoleBindingList"
            },
            "Config": {
                "$ref": "#/definitions/kubernetes_config_Config",
                "javaType": "io.fabric8.kubernetes.api.model.Config"
            },
            "ContainerStatus": {
                "$ref": "#/definitions/kubernetes_ContainerStatus",
                "javaType": "io.fabric8.kubernetes.api.model.ContainerStatus"
            },
            "DeploymentConfigList": {
                "$ref": "#/definitions/os_deploy_DeploymentConfigList",
                "javaType": "io.fabric8.openshift.api.model.DeploymentConfigList"
            },
            "Endpoints": {
                "$ref": "#/definitions/kubernetes_Endpoints",
                "javaType": "io.fabric8.kubernetes.api.model.Endpoints"
            },
            "EndpointsList": {
                "$ref": "#/definitions/kubernetes_EndpointsList",
                "javaType": "io.fabric8.kubernetes.api.model.EndpointsList"
            },
            "EnvVar": {
                "$ref": "#/definitions/kubernetes_EnvVar",
                "javaType": "io.fabric8.kubernetes.api.model.EnvVar"
            },
            "EventList": {
                "$ref": "#/definitions/kubernetes_EventList",
                "javaType": "io.fabric8.kubernetes.api.model.EventList"
            },
            "Group": {
                "$ref": "#/definitions/os_user_Group",
                "javaType": "io.fabric8.openshift.api.model.Group"
            },
            "GroupList": {
                "$ref": "#/definitions/os_user_GroupList",
                "javaType": "io.fabric8.openshift.api.model.GroupList"
            },
            "Identity": {
                "$ref": "#/definitions/os_user_Identity",
                "javaType": "io.fabric8.openshift.api.model.Identity"
            },
            "IdentityList": {
                "$ref": "#/definitions/os_user_IdentityList",
                "javaType": "io.fabric8.openshift.api.model.IdentityList"
            },
            "ImageList": {
                "$ref": "#/definitions/os_image_ImageList",
                "javaType": "io.fabric8.openshift.api.model.ImageList"
            },
            "ImageStreamList": {
                "$ref": "#/definitions/os_image_ImageStreamList",
                "javaType": "io.fabric8.openshift.api.model.ImageStreamList"
            },
            "LocalSubjectAccessReview": {
                "$ref": "#/definitions/os_authorization_LocalSubjectAccessReview",
                "javaType": "io.fabric8.openshift.api.model.LocalSubjectAccessReview"
            },
            "Namespace": {
                "$ref": "#/definitions/kubernetes_Namespace",
                "javaType": "io.fabric8.kubernetes.api.model.Namespace"
            },
            "NamespaceList": {
                "$ref": "#/definitions/kubernetes_NamespaceList",
                "javaType": "io.fabric8.kubernetes.api.model.NamespaceList"
            },
            "Node": {
                "$ref": "#/definitions/kubernetes_Node",
                "javaType": "io.fabric8.kubernetes.api.model.Node"
            },
            "NodeList": {
                "$ref": "#/definitions/kubernetes_NodeList",
                "javaType": "io.fabric8.kubernetes.api.model.NodeList"
            },
            "OAuthAccessToken": {
                "$ref": "#/definitions/os_oauth_OAuthAccessToken",
                "javaType": "io.fabric8.openshift.api.model.OAuthAccessToken"
            },
            "OAuthAccessTokenList": {
                "$ref": "#/definitions/os_oauth_OAuthAccessTokenList",
                "javaType": "io.fabric8.openshift.api.model.OAuthAccessTokenList"
            },
            "OAuthAuthorizeToken": {
                "$ref": "#/definitions/os_oauth_OAuthAuthorizeToken",
                "javaType": "io.fabric8.openshift.api.model.OAuthAuthorizeToken"
            },
            "OAuthAuthorizeTokenList": {
                "$ref": "#/definitions/os_oauth_OAuthAuthorizeTokenList",
                "javaType": "io.fabric8.openshift.api.model.OAuthAuthorizeTokenList"
            },
            "OAuthClient": {
                "$ref": "#/definitions/os_oauth_OAuthClient",
                "javaType": "io.fabric8.openshift.api.model.OAuthClient"
            },
            "OAuthClientAuthorization": {
                "$ref": "#/definitions/os_oauth_OAuthClientAuthorization",
                "javaType": "io.fabric8.openshift.api.model.OAuthClientAuthorization"
            },
            "OAuthClientAuthorizationList": {
                "$ref": "#/definitions/os_oauth_OAuthClientAuthorizationList",
                "javaType": "io.fabric8.openshift.api.model.OAuthClientAuthorizationList"
            },
            "OAuthClientList": {
                "$ref": "#/definitions/os_oauth_OAuthClientList",
                "javaType": "io.fabric8.openshift.api.model.OAuthClientList"
            },
            "ObjectMeta": {
                "$ref": "#/definitions/kubernetes_ObjectMeta",
                "javaType": "io.fabric8.kubernetes.api.model.ObjectMeta"
            },
            "PersistentVolume": {
                "$ref": "#/definitions/kubernetes_PersistentVolume",
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolume"
            },
            "PersistentVolumeClaim": {
                "$ref": "#/definitions/kubernetes_PersistentVolumeClaim",
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaim"
            },
            "PersistentVolumeClaimList": {
                "$ref": "#/definitions/kubernetes_PersistentVolumeClaimList",
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeClaimList"
            },
            "PersistentVolumeList": {
                "$ref": "#/definitions/kubernetes_PersistentVolumeList",
                "javaType": "io.fabric8.kubernetes.api.model.PersistentVolumeList"
            },
            "PodList": {
                "$ref": "#/definitions/kubernetes_PodList",
                "javaType": "io.fabric8.kubernetes.api.model.PodList"
            },
            "Policy": {
                "$ref": "#/definitions/os_authorization_Policy",
                "javaType": "io.fabric8.openshift.api.model.Policy"
            },
            "PolicyBinding": {
                "$ref": "#/definitions/os_authorization_PolicyBinding",
                "javaType": "io.fabric8.openshift.api.model.PolicyBinding"
            },
            "PolicyBindingList": {
                "$ref": "#/definitions/os_authorization_PolicyBindingList",
                "javaType": "io.fabric8.openshift.api.model.PolicyBindingList"
            },
            "PolicyList": {
                "$ref": "#/definitions/os_authorization_PolicyList",
                "javaType": "io.fabric8.openshift.api.model.PolicyList"
            },
            "Project": {
                "$ref": "#/definitions/os_project_Project",
                "javaType": "io.fabric8.openshift.api.model.Project"
            },
            "ProjectList": {
                "$ref": "#/definitions/os_project_ProjectList",
                "javaType": "io.fabric8.openshift.api.model.ProjectList"
            },
            "ProjectRequest": {
                "$ref": "#/definitions/os_project_ProjectRequest",
                "javaType": "io.fabric8.openshift.api.model.ProjectRequest"
            },
            "Quantity": {
                "$ref": "#/definitions/kubernetes_resource_Quantity",
                "javaType": "io.fabric8.kubernetes.api.model.Quantity"
            },
            "ReplicationControllerList": {
                "$ref": "#/definitions/kubernetes_ReplicationControllerList",
                "javaType": "io.fabric8.kubernetes.api.model.ReplicationControllerList"
            },
            "ResourceQuota": {
                "$ref": "#/definitions/kubernetes_ResourceQuota",
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuota"
            },
            "ResourceQuotaList": {
                "$ref": "#/definitions/kubernetes_ResourceQuotaList",
                "javaType": "io.fabric8.kubernetes.api.model.ResourceQuotaList"
            },
            "Role": {
                "$ref": "#/definitions/os_authorization_Role",
                "javaType": "io.fabric8.openshift.api.model.Role"
            },
            "RoleBinding": {
                "$ref": "#/definitions/os_authorization_RoleBinding",
                "javaType": "io.fabric8.openshift.api.model.RoleBinding"
            },
            "RoleBindingList": {
                "$ref": "#/definitions/os_authorization_RoleBindingList",
                "javaType": "io.fabric8.openshift.api.model.RoleBindingList"
            },
            "RoleList": {
                "$ref": "#/definitions/os_authorization_RoleList",
                "javaType": "io.fabric8.openshift.api.model.RoleList"
            },
            "RootPaths": {
                "$ref": "#/definitions/api_RootPaths",
                "javaType": "io.fabric8.kubernetes.api.model.RootPaths"
            },
            "RouteList": {
                "$ref": "#/definitions/os_route_RouteList",
                "javaType": "io.fabric8.openshift.api.model.RouteList"
            },
            "Secret": {
                "$ref": "#/definitions/kubernetes_Secret",
                "javaType": "io.fabric8.kubernetes.api.model.Secret"
            },
            "SecretList": {
                "$ref": "#/definitions/kubernetes_SecretList",
                "javaType": "io.fabric8.kubernetes.api.model.SecretList"
            },
            "SecurityContextConstraints": {
                "$ref": "#/definitions/kubernetes_SecurityContextConstraints",
                "javaType": "io.fabric8.kubernetes.api.model.SecurityContextConstraints"
            },
            "SecurityContextConstraintsList": {
                "$ref": "#/definitions/kubernetes_SecurityContextConstraintsList",
                "javaType": "io.fabric8.kubernetes.api.model.SecurityContextConstraintsList"
            },
            "ServiceAccount": {
                "$ref": "#/definitions/kubernetes_ServiceAccount",
                "javaType": "io.fabric8.kubernetes.api.model.ServiceAccount"
            },
            "ServiceAccountList": {
                "$ref": "#/definitions/kubernetes_ServiceAccountList",
                "javaType": "io.fabric8.kubernetes.api.model.ServiceAccountList"
            },
            "ServiceList": {
                "$ref": "#/definitions/kubernetes_ServiceList",
                "javaType": "io.fabric8.kubernetes.api.model.ServiceList"
            },
            "Status": {
                "$ref": "#/definitions/kubernetes_Status",
                "javaType": "io.fabric8.kubernetes.api.model.Status"
            },
            "SubjectAccessReview": {
                "$ref": "#/definitions/os_authorization_SubjectAccessReview",
                "javaType": "io.fabric8.openshift.api.model.SubjectAccessReview"
            },
            "SubjectAccessReviewResponse": {
                "$ref": "#/definitions/os_authorization_SubjectAccessReviewResponse",
                "javaType": "io.fabric8.openshift.api.model.SubjectAccessReviewResponse"
            },
            "TagEvent": {
                "$ref": "#/definitions/os_image_TagEvent",
                "javaType": "io.fabric8.openshift.api.model.TagEvent"
            },
            "Template": {
                "$ref": "#/definitions/os_template_Template",
                "javaType": "io.fabric8.openshift.api.model.Template"
            },
            "TemplateList": {
                "$ref": "#/definitions/os_template_TemplateList",
                "javaType": "io.fabric8.openshift.api.model.TemplateList"
            },
            "User": {
                "$ref": "#/definitions/os_user_User",
                "javaType": "io.fabric8.openshift.api.model.User"
            },
            "UserList": {
                "$ref": "#/definitions/os_user_UserList",
                "javaType": "io.fabric8.openshift.api.model.UserList"
            },
            "WatchEvent": {
                "$ref": "#/definitions/kubernetes_watch_WatchEvent",
                "javaType": "io.fabric8.kubernetes.api.model.WatchEvent"
            }
        },
        "additionalProperties": true
    };
})(Kubernetes || (Kubernetes = {}));

/// <reference path="schema.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    var hiddenProperties = ['status', 'deletionTimestamp'];
    function withProperty(schema, name, action) {
        if (schema.properties[name]) {
            action(schema.properties[name]);
        }
    }
    function hideProperties(schema) {
        _.forEach(hiddenProperties, function (property) {
            withProperty(schema, property, function (property) {
                property.hidden = true;
            });
        });
    }
    Kubernetes._module.factory('KubernetesSchema', ['SchemaRegistry', function (schemas) {
            Kubernetes.configureSchema();
            schemas.addListener("k8s schema customizer", function (name, schema) {
                if (schema.properties) {
                    if (schema.properties.name) {
                        schema.controls = ['name', '*'];
                    }
                    withProperty(schema, 'portalIP', function (property) {
                        property.label = "Portal IP";
                    });
                    withProperty(schema, 'publicIPs', function (property) {
                        property.label = "Public IPs";
                    });
                    withProperty(schema, 'Spec', function (property) {
                        property.label = 'false';
                    });
                    withProperty(schema, 'Metadata', function (property) {
                        property.label = 'false';
                    });
                    hideProperties(schema);
                }
                if (_.endsWith(name, "ServiceSpec")) {
                    schema.controls = ["portalIP", "createExternalLoadBalancer", "sessionAffinity", "publicIPs", "ports", "selector", "*"];
                    withProperty(schema, 'sessionAffinity', function (property) {
                        Kubernetes.log.debug("Schema: ", schema);
                        property.enum = ['None', 'ClientIP'];
                        property.default = 'None';
                    });
                }
                if (_.endsWith(name, "Service")) {
                    schema.controls = undefined;
                    schema.tabs = {
                        'Basic Information': ['metadata'],
                        'Details': ['*']
                    };
                    Kubernetes.log.debug("Name: ", name, " Schema: ", schema);
                }
            });
            schemas.addSchema('kubernetes', Kubernetes.schema);
            // now lets iterate and add all the definitions too
            angular.forEach(Kubernetes.schema.definitions, function (definition, typeName) {
                //schemas.addSchema(typeName, definition);
                schemas.addSchema("#/definitions/" + typeName, definition);
            });
            return Kubernetes.schema;
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    // facade this to the watcher service
    var KubernetesStateImpl = (function () {
        function KubernetesStateImpl(watcher) {
            this.watcher = watcher;
        }
        Object.defineProperty(KubernetesStateImpl.prototype, "namespaces", {
            get: function () {
                return _.map(this.watcher.getObjects(Kubernetes.WatchTypes.NAMESPACES), function (namespace) {
                    return namespace.metadata.name;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KubernetesStateImpl.prototype, "selectedNamespace", {
            get: function () {
                return this.watcher.getNamespace();
            },
            set: function (namespace) {
                this.watcher.setNamespace(namespace);
            },
            enumerable: true,
            configurable: true
        });
        return KubernetesStateImpl;
    }());
    Kubernetes._module.factory('KubernetesState', ['WatcherService', function (watcher) {
            return new KubernetesStateImpl(watcher);
        }]);
    // TODO this doesn't need to be a service really
    Kubernetes._module.factory('KubernetesApiURL', function () { return Kubernetes.kubernetesApiUrl(); });
    // TODO we'll get rid of this...
    Kubernetes._module.factory('KubernetesVersion', [function () {
            return {
                query: function () { return null; }
            };
        }]);
    // TODO let's move these into KubernetesModel so controllers don't have to inject them separately
    Kubernetes._module.factory('KubernetesPods', ['KubernetesModel', function (KubernetesModel) {
            return KubernetesModel['podsResource'];
        }]);
    Kubernetes._module.factory('KubernetesReplicationControllers', ['KubernetesModel', function (KubernetesModel) {
            return KubernetesModel['replicationcontrollersResource'];
        }]);
    Kubernetes._module.factory('KubernetesServices', ['KubernetesModel', function (KubernetesModel) {
            return KubernetesModel['servicesResource'];
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.FileDropController = Kubernetes.controller("FileDropController", ["$scope", "KubernetesModel", "FileUploader", '$http', function ($scope, model, FileUploader, $http) {
            var uploader = $scope.uploader = new FileUploader({
                autoUpload: false,
                removeAfterUpload: true,
                url: Kubernetes.kubernetesApiUrl()
            });
            $scope.uploader.onAfterAddingFile = function (file) {
                var reader = new FileReader();
                reader.onload = function () {
                    if (reader.readyState === 2) {
                        Kubernetes.log.debug("File added: ", file);
                        var json = reader.result;
                        var obj = null;
                        try {
                            obj = angular.fromJson(json);
                        }
                        catch (err) {
                            Kubernetes.log.debug("Failed to read dropped file ", file._file.name, ": ", err);
                            return;
                        }
                        Kubernetes.log.debug("Dropped object: ", obj);
                        Kubernetes.updateOrCreateObject(obj, model);
                    }
                };
                reader.readAsText(file._file);
            };
            $scope.uploader.onBeforeUploadItem = function (item) {
                Kubernetes.log.debug("Uploading: ", item);
                //Core.notification('info', 'Uploading ' + item);
            };
            $scope.uploader.onSuccessItem = function (item) {
                Kubernetes.log.debug("onSuccessItem: ", item);
            };
            $scope.uploader.onErrorItem = function (item, response, status) {
                Kubernetes.log.debug("Failed to apply, response: ", response, " status: ", status);
            };
        }]);
    Kubernetes.NamespaceController = Kubernetes.controller('NamespaceController', ['$scope', 'WatcherService', function ($scope, watcher) {
            $scope.namespaces = watcher.getObjects('namespaces');
            $scope.$watchCollection('namespaces', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.namespace = watcher.getNamespace();
                }
            });
            $scope.$watch('namespace', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (newValue !== oldValue) {
                        watcher.setNamespace(newValue);
                    }
                }
            });
        }]);
    Kubernetes.TopLevel = Kubernetes.controller("TopLevel", ["$scope", "KubernetesVersion", "KubernetesState", function ($scope, KubernetesVersion, KubernetesState) {
            $scope.version = undefined;
            $scope.showAppView = Kubernetes.isAppView();
            $scope.isActive = function (href) {
                return Kubernetes.isLinkActive(href);
            };
            $scope.kubernetes = KubernetesState;
            KubernetesVersion.query(function (response) {
                $scope.version = response;
            });
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.NamespaceController = Kubernetes.controller("NamespaceController", ["$scope", "WatcherService", function ($scope, watcher) {
            $scope.watcher = watcher;
            $scope.namespaceObjects = watcher.getObjects('namespaces');
            $scope.namespace = watcher.getNamespace();
            $scope.namespaces = [];
            $scope.$watch('namespace', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    watcher.setNamespace(newValue);
                }
            });
            $scope.$watch('watcher.getNamespace()', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.namespace = newValue;
                }
            });
            $scope.$watchCollection('namespaceObjects', function (namespaceObjects) {
                $scope.namespaces = _.map(namespaceObjects, function (namespace) { return namespace.metadata.name; });
            });
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    var OverviewDirective = Kubernetes._module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", "KubernetesState", 'KubernetesModel', function ($templateCache, $compile, $interpolate, $timeout, $window, KubernetesState, KubernetesModel) {
            var log = Logger.get('kubernetes-overview');
            var model = KubernetesModel;
            var state = KubernetesState;
            return {
                restrict: 'E',
                replace: true,
                link: function (scope, element, attr) {
                    scope.model = model;
                    element.css({ visibility: 'hidden' });
                    scope.getEntity = function (type, key) {
                        switch (type) {
                            case 'host':
                                return model.podsByHost[key];
                            case 'pod':
                                return model.podsByKey[key];
                            case 'replicationController':
                                return model.replicationControllersByKey[key];
                            case 'service':
                                return model.servicesByKey[key];
                            default:
                                return undefined;
                        }
                    };
                    scope.kubernetes = state;
                    scope.customizeDefaultOptions = function (options) {
                        options.Endpoint = ['Blank', {}];
                    };
                    scope.mouseEnter = function ($event) {
                        if (scope.jsPlumb) {
                            angular.element($event.currentTarget).addClass("hovered");
                            scope.jsPlumb.getEndpoints($event.currentTarget).forEach(function (endpoint) {
                                endpoint.connections.forEach(function (connection) {
                                    if (!connection.isHover()) {
                                        connection.setHover(true);
                                        connection.endpoints.forEach(function (e) {
                                            scope.mouseEnter({
                                                currentTarget: e.element
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    };
                    scope.mouseLeave = function ($event) {
                        if (scope.jsPlumb) {
                            angular.element($event.currentTarget).removeClass("hovered");
                            scope.jsPlumb.getEndpoints($event.currentTarget).forEach(function (endpoint) {
                                endpoint.connections.forEach(function (connection) {
                                    if (connection.isHover()) {
                                        connection.setHover(false);
                                        connection.endpoints.forEach(function (e) {
                                            scope.mouseLeave({
                                                currentTarget: e.element
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    };
                    /*
                    scope.customizeEndpointOptions = (jsPlumb, node, options) => {
                      var type = node.el.attr('data-type');
                      // log.debug("endpoint type: ", type);
                      switch (type) {
                        case 'pod':
                          break;
                        case 'service':
                          break;
                        case 'replicationController':
                          break;
                      }
                    };
                    */
                    scope.customizeConnectionOptions = function (jsPlumb, edge, params, options) {
                        var type = edge.source.el.attr('data-type');
                        options.connector = ["Bezier", { curviness: 50, stub: 25, alwaysRespectStubs: true }];
                        params.paintStyle = {
                            lineWidth: 2,
                            strokeStyle: '#5555cc'
                        };
                        switch (type) {
                            case 'pod':
                                break;
                            case 'service':
                                params.anchors = [
                                    ["Continuous", { faces: ["right"] }],
                                    ["Continuous", { faces: ["left"] }]
                                ];
                                break;
                            case 'replicationController':
                                params.anchors = [
                                    ["Perimeter", { shape: "Circle" }],
                                    ["Continuous", { faces: ["right"] }]
                                ];
                                break;
                        }
                        //log.debug("connection source type: ", type);
                        return options;
                    };
                    function interpolate(template, config) {
                        return $interpolate(template)(config);
                    }
                    function createElement(template, thingName, thing) {
                        var config = {};
                        config[thingName] = thing;
                        return interpolate(template, config);
                    }
                    function createElements(template, thingName, things) {
                        return things.map(function (thing) {
                            return createElement(template, thingName, thing);
                        });
                    }
                    function appendNewElements(parentEl, template, thingName, things) {
                        things.forEach(function (thing) {
                            var key = thing['_key'] || thing['elementId'] || thing['id'];
                            var existing = parentEl.find("#" + key);
                            if (!existing.length) {
                                log.debug("existing: ", existing, " key: ", key);
                                parentEl.append($compile(createElement(template, thingName, thing))(scope));
                            }
                        });
                    }
                    function namespaceFilter(item) {
                        return Kubernetes.getNamespace(item) === scope.kubernetes.selectedNamespace;
                    }
                    function firstDraw() {
                        log.debug("First draw");
                        element.empty();
                        var services = model.services;
                        var replicationControllers = model.replicationControllers;
                        var pods = model.pods;
                        var hosts = model.hosts;
                        // log.debug("hosts: ", model.hosts);
                        var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
                        var servicesEl = parentEl.find(".services");
                        var hostsEl = parentEl.find(".hosts");
                        var replicationControllersEl = parentEl.find(".replicationControllers");
                        servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services.filter(namespaceFilter)));
                        replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers.filter(namespaceFilter)));
                        hosts.forEach(function (host) {
                            var hostEl = angular.element(createElement($templateCache.get("overviewHostTemplate.html"), 'host', host));
                            var podContainer = angular.element(hostEl.find('.pod-container'));
                            podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods));
                            hostsEl.append(hostEl);
                        });
                        //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
                        element.append($compile(parentEl)(scope));
                        $timeout(function () { element.css({ visibility: 'visible' }); }, 250);
                    }
                    function update() {
                        scope.$emit('jsplumbDoWhileSuspended', function () {
                            log.debug("Update");
                            var services = model.services;
                            var replicationControllers = model.replicationControllers;
                            var pods = model.pods;
                            var hosts = model.hosts;
                            var parentEl = element.find('[hawtio-jsplumb]');
                            var children = parentEl.find('.jsplumb-node');
                            children.each(function (index, c) {
                                var child = angular.element(c);
                                var key = child.attr('id');
                                log.debug('key: ', key);
                                if (Core.isBlank(key)) {
                                    return;
                                }
                                var type = child.attr('data-type');
                                switch (type) {
                                    case 'host':
                                        if (key in model.podsByHost) {
                                            return;
                                        }
                                        break;
                                    case 'service':
                                        if (key in model.servicesByKey && Kubernetes.getNamespace(model.servicesByKey[key]) == scope.kubernetes.selectedNamespace) {
                                            var service = model.servicesByKey[key];
                                            child.attr('connect-to', service.connectTo);
                                            return;
                                        }
                                        break;
                                    case 'pod':
                                        /*
                                        if (hasId(pods, id)) {
                                          return;
                                        }
                                        */
                                        if (key in model.podsByKey) {
                                            return;
                                        }
                                        break;
                                    case 'replicationController':
                                        if (key in model.replicationControllersByKey) {
                                            var replicationController = model.replicationControllersByKey[key];
                                            child.attr('connect-to', replicationController.connectTo);
                                            return;
                                        }
                                        break;
                                    default:
                                        log.debug("Ignoring element with unknown type");
                                        return;
                                }
                                log.debug("Removing: ", key);
                                child.remove();
                            });
                            var servicesEl = element.find(".services");
                            var replicationControllersEl = element.find(".replicationControllers");
                            var hostsEl = element.find(".hosts");
                            appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services);
                            appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers);
                            appendNewElements(hostsEl, $templateCache.get("overviewHostTemplate.html"), "host", hosts);
                            hosts.forEach(function (host) {
                                var hostEl = angular.element(hostsEl.find("#" + host.elementId));
                                var podContainer = angular.element(hostEl.find('.pod-container'));
                                appendNewElements(podContainer, $templateCache.get("podTemplate.html"), "pod", host.pods);
                            });
                        });
                    }
                    function refreshDrawing() {
                        log.debug("Refreshing drawing");
                        if (element.children().length === 0) {
                            firstDraw();
                        }
                        else {
                            update();
                        }
                        Core.$apply(scope);
                    }
                    scope.$on('kubernetesModelUpdated', _.debounce(refreshDrawing, 500, { trailing: true }));
                    setTimeout(refreshDrawing, 100);
                }
            };
        }]);
    var OverviewBoxController = Kubernetes.controller("OverviewBoxController", ["$scope", "$location", function ($scope, $location) {
            $scope.viewDetails = function (entity, path) {
                if (entity) {
                    var namespace = Kubernetes.getNamespace(entity);
                    var id = Kubernetes.getName(entity);
                    $location.path(UrlHelpers.join('/kubernetes/namespace', namespace, path, id));
                }
                else {
                    Kubernetes.log.warn("No entity for viewDetails!");
                }
            };
        }]);
    var scopeName = "OverviewController";
    var OverviewController = Kubernetes.controller(scopeName, ["$scope", "$location", "$http", "$timeout", "$routeParams", "KubernetesModel", "KubernetesState", "KubernetesApiURL", function ($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL) {
            $scope.name = scopeName;
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.PipelinesController = Kubernetes.controller("PipelinesController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            /**
             * Lets update the various data to join them together to a pipeline model
             */
            function updateData() {
                var pipelineSteps = {};
                if ($scope.buildConfigs && $scope.builds && $scope.deploymentConfigs) {
                    Kubernetes.enrichBuildConfigs($scope.buildConfigs, $scope.builds);
                    $scope.fetched = true;
                    angular.forEach($scope.buildConfigs, function (buildConfig) {
                        var pipelineKey = createPipelineKey(buildConfig);
                        if (pipelineKey) {
                            pipelineSteps[pipelineKey] = {
                                buildConfig: buildConfig,
                                builds: [],
                                triggeredBy: null,
                                triggersSteps: [],
                                $class: 'pipeline-build'
                            };
                        }
                    });
                    angular.forEach($scope.builds, function (build) {
                        var pipelineKey = createPipelineKey(build);
                        if (pipelineKey) {
                            var pipeline = pipelineSteps[pipelineKey];
                            if (!pipeline) {
                                //console.log("warning no pipeline generated for buildConfig for key " + pipelineKey + " for build " + angular.toJson(build, true));
                                console.log("warning no pipeline generated for buildConfig for key " + pipelineKey + " for build " + build.$name);
                            }
                            else {
                                pipeline.builds.push(build);
                            }
                        }
                    });
                    // TODO now we need to look at the triggers to figure out which pipelineSteps triggers each pipelineStep
                    // now lets create an array of all pipelines, starting from the first known step with a list of the steps
                    var pipelines = [];
                    angular.forEach(pipelineSteps, function (pipelineStep, key) {
                        if (!pipelineStep.triggeredBy) {
                            // we are a root step....
                            pipelines.push(pipelineStep);
                            // now lets add all the steps for this key...
                            pipelineStep.triggersSteps.push(pipelineStep);
                            angular.forEach(pipelineSteps, function (step) {
                                if (step.triggeredBy === key) {
                                    pipelineStep.triggersSteps.push(step);
                                }
                            });
                        }
                    });
                    angular.forEach($scope.deploymentConfigs, function (deploymentConfig) {
                        if (!deploymentConfig.kind) {
                            deploymentConfig.kind = "DeploymentConfig";
                        }
                        angular.forEach(deploymentConfig.triggers, function (trigger) {
                            var type = trigger.type;
                            var imageChangeParams = trigger.imageChangeParams;
                            if (imageChangeParams && type === "ImageChange") {
                                var from = imageChangeParams.from;
                                if (from) {
                                    var name = from.name;
                                    if (from.kind === "ImageRepository") {
                                        var tag = imageChangeParams.tag || "latest";
                                        if (name) {
                                            // now lets find a pipeline step which fires from this
                                            angular.forEach(pipelineSteps, function (pipelineStep, key) {
                                                var to = Core.pathGet(pipelineStep, ["buildConfig", "parameters", "output", "to"]);
                                                if (to && (to.kind === "ImageRepository" || to.kind === "ImageStream")) {
                                                    var toName = to.name;
                                                    if (toName === name) {
                                                        var selector = Core.pathGet(deploymentConfig, ["template", "controllerTemplate", "selector"]);
                                                        var pods = [];
                                                        var $podCounters = selector ? Kubernetes.createPodCounters(selector, KubernetesModel.podsForNamespace(), pods) : null;
                                                        var deployPipelineStep = {
                                                            buildConfig: deploymentConfig,
                                                            $class: 'pipeline-deploy',
                                                            $podCounters: $podCounters,
                                                            $pods: pods
                                                        };
                                                        pipelineStep.triggersSteps.push(deployPipelineStep);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    });
                    $scope.pipelines = pipelines;
                }
            }
            /**
             * Lets create a unique key for build / config we can use to do linking of builds / configs / triggers
             */
            function createPipelineKey(buildConfig) {
                return Core.pathGet(buildConfig, ["parameters", "source", "git", "uri"]);
            }
            $scope.$keepPolling = function () { return Kubernetes.keepPollingModel; };
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                var ready = 0;
                var numServices = 3;
                function maybeNext() {
                    if (++ready >= numServices) {
                        next();
                    }
                }
                var url = Kubernetes.buildsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        $scope.builds = Kubernetes.enrichBuilds(data.items);
                        updateData();
                    }
                    maybeNext();
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    maybeNext();
                });
                url = Kubernetes.buildConfigsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        $scope.buildConfigs = data.items;
                        updateData();
                    }
                    maybeNext();
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    maybeNext();
                });
                url = Kubernetes.deploymentConfigsRestURL();
                $http.get(url).
                    success(function (data, status, headers, config) {
                    if (data) {
                        $scope.deploymentConfigs = data.items;
                        updateData();
                    }
                    maybeNext();
                }).
                    error(function (data, status, headers, config) {
                    Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                    maybeNext();
                });
            });
            $scope.fetch();
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.PodController = Kubernetes.controller("PodController", ["$scope", "KubernetesModel", "KubernetesState", "ServiceRegistry", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "$window", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, ServiceRegistry, $templateCache, $location, $routeParams, $http, $timeout, $window, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.rawMode = false;
            $scope.rawModel = null;
            $scope.itemConfig = {
                properties: {
                    'containers/image$': {
                        template: $templateCache.get('imageTemplate.html')
                    },
                    'status/phase': {
                        template: $templateCache.get('statusTemplate.html')
                    },
                    '\\/Env\\/': {
                        template: $templateCache.get('envItemTemplate.html')
                    },
                    '^\\/labels$': {
                        template: $templateCache.get('labelTemplate.html')
                    },
                    '\\/env\\/key$': {
                        hidden: true
                    }
                }
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.$watch('model.pods', function (newValue, oldValue) {
                updateData();
            }, true);
            $scope.flipRaw = function () {
                $scope.rawMode = !$scope.rawMode;
                Core.$apply($scope);
            };
            $scope.openLogs = function () {
                var pods = [$scope.item];
                Kubernetes.openLogsForPods(ServiceRegistry, $window, KubernetesModel.currentNamespace(), pods);
            };
            updateData();
            function updateData() {
                $scope.id = $routeParams["id"];
                $scope.item = $scope.model.getPod(KubernetesState.selectedNamespace, $scope.id);
                if ($scope.item) {
                    $scope.rawModel = Kubernetes.toRawJson($scope.item);
                }
                Core.$apply($scope);
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.PodEditController = Kubernetes.controller("PodEditController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "SchemaRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, schemas) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = schemas.cloneSchema("io.fabric8.kubernetes.api.model.Pod");
            //$scope.config = KubernetesSchema.definitions.kubernetes_v1beta2_Pod;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                if ($scope.id) {
                    $scope.entity = $scope.model.getPod(KubernetesState.selectedNamespace, $scope.id);
                    Core.$apply($scope);
                    $scope.fetched = true;
                }
                else {
                    $scope.fetched = true;
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="utilHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.EnvItem = Kubernetes.controller("EnvItem", ["$scope", function ($scope) {
            var parts = $scope.data.split('=');
            $scope.key = parts.shift();
            $scope.value = parts.join('=');
        }]);
    // main controller for the page
    Kubernetes.Pods = Kubernetes.controller("Pods", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesPods, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.itemSchema = Forms.createFormConfiguration();
            $scope.tableConfig = {
                data: 'model.pods',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: '_key',
                        displayName: 'Name',
                        defaultSort: true,
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    {
                        field: '$statusCss',
                        displayName: 'Status',
                        cellTemplate: $templateCache.get("statusTemplate.html")
                    },
                    { field: '$eventCount',
                        displayName: 'Events',
                        cellTemplate: $templateCache.get("eventSummaryTemplate.html")
                    },
                    {
                        field: '$restartCount',
                        displayName: 'Restarts'
                    },
                    {
                        field: '$createdTime',
                        displayName: 'Age',
                        cellTemplate: $templateCache.get("ageTemplate.html")
                    },
                    {
                        field: '$imageNames',
                        displayName: 'Images',
                        cellTemplate: $templateCache.get("imageTemplate.html")
                    },
                    {
                        field: '$host',
                        displayName: 'Host',
                        cellTemplate: $templateCache.get("hostTemplate.html")
                    },
                    {
                        field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    },
                    {
                        field: '$podIP',
                        displayName: 'Pod IP',
                        customSortField: function (field) {
                            // use a custom sort to sort ip address
                            return Kubernetes.sortByPodIp(field.$podIP);
                        }
                    }
                ]
            };
            $scope.openLogs = function () {
                var pods = $scope.tableConfig.selectedItems;
                if (!pods || !pods.length) {
                    if ($scope.id) {
                        var item = $scope.item;
                        if (item) {
                            pods = [item];
                        }
                    }
                }
                Kubernetes.openLogsForPods(ServiceRegistry, $window, KubernetesModel.currentNamespace(), pods);
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.deletePrompt = function (selected) {
                if (angular.isString(selected)) {
                    selected = [{
                            id: selected
                        }];
                }
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: 'metadata.name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    Kubernetes.log.debug("deleting: ", Kubernetes.getName(next));
                                    KubernetesPods.delete({
                                        id: Kubernetes.getName(next)
                                    }, undefined, function () {
                                        Kubernetes.log.debug("deleted: ", Kubernetes.getName(next));
                                        deleteSelected(selected, selected.shift());
                                    }, function (error) {
                                        Kubernetes.log.debug("Error deleting: ", error);
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete pods?',
                    action: 'The following pods will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ReplicationControllerController = Kubernetes.controller("ReplicationControllerController", ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.rawMode = false;
            $scope.rawModel = null;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.itemConfig = {
                properties: {
                    '^\\/labels$': {
                        template: $templateCache.get('labelTemplate.html')
                    }
                }
            };
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.$watch('model.pods', function (newValue, oldValue) {
                updateData();
            }, true);
            $scope.flipRaw = function () {
                $scope.rawMode = !$scope.rawMode;
                Core.$apply($scope);
            };
            updateData();
            function updateData() {
                $scope.id = $routeParams["id"];
                $scope.item = $scope.model.getReplicationController(KubernetesState.selectedNamespace, $scope.id);
                if ($scope.item) {
                    $scope.rawModel = Kubernetes.toRawJson($scope.item);
                }
                Core.$apply($scope);
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ReplicationControllerEditController = Kubernetes.controller("ReplicationControllerEditController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "SchemaRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, schemas) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            Kubernetes.log.debug("Schema: ", $scope.schema);
            $scope.config = schemas.cloneSchema("io.fabric8.kubernetes.api.model.ReplicationController");
            //$$scope.config = KubernetesSchema.definitions.kubernetes_v1beta3_ReplicationController;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                if ($scope.id) {
                    $scope.entity = $scope.model.getReplicationController(KubernetesState.selectedNamespace, $scope.id);
                    Core.$apply($scope);
                    $scope.fetched = true;
                }
                else {
                    $scope.fetched = true;
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ReplicationControllers = Kubernetes.controller("ReplicationControllers", ["$scope", "KubernetesModel", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesReplicationControllers, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.tableConfig = {
                data: 'model.replicationControllers',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    { field: '_key',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    { field: '$podCount',
                        displayName: 'Pods',
                        cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html"),
                        customSortField: function (field) {
                            // need to concat all the pod counters
                            var ready = field.$podCounters.ready || 0;
                            var valid = field.$podCounters.valid || 0;
                            var waiting = field.$podCounters.waiting || 0;
                            var error = field.$podCounters.error || 0;
                            return ready + valid + waiting + error;
                        }
                    },
                    { field: '$replicas',
                        displayName: 'Replicas',
                        cellTemplate: $templateCache.get("desiredReplicas.html")
                    },
                    { field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    },
                    { field: '$eventCount',
                        displayName: 'Events',
                        cellTemplate: $templateCache.get("eventSummaryTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.deletePrompt = function (selected) {
                if (angular.isString(selected)) {
                    selected = [{
                            id: selected
                        }];
                }
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: 'metadata.name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    Kubernetes.log.debug("deleting: ", Kubernetes.getName(next));
                                    KubernetesReplicationControllers.delete({
                                        id: Kubernetes.getName(next)
                                    }, undefined, function () {
                                        Kubernetes.log.debug("deleted: ", Kubernetes.getName(next));
                                        deleteSelected(selected, selected.shift());
                                    }, function (error) {
                                        Kubernetes.log.debug("Error deleting: ", error);
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete replication controllers?',
                    action: 'The following replication controllers will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.SecretController = Kubernetes.controller("SecretController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "K8SClientFactory",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            Kubernetes.selectSubNavBar($scope, "Secrets", $scope.id ? "Edit Secret: " + $scope.id : "Create Secret");
            var kubeClient = Kubernetes.createKubernetesClient("secrets");
            $scope.sshKeys = ["ssh-key", "ssh-key.pub"];
            $scope.httpsKeys = ["username", "password"];
            var secretLabels = {
                "ssh-key": "SSH private key",
                "ssh-key.pub": "SSH public key",
                "ca.crt": "CA Certificate",
                ".dockercfg": "Docker config",
                "username": "User name"
            };
            var secretTooltips = {
                "ssh-key": "SSH private key text contents",
                "ca.crt": "Certificate Authority (CA) Certificate",
                ".dockercfg": "Docker configuration token"
            };
            $scope.$on('kubernetesModelUpdated', function () {
                if ($scope.id && !$scope.secret) {
                    updateData();
                }
            });
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.propertyKeys = function () {
                return _.keys(secretLabels);
            };
            $scope.checkNameUnique = function (value) {
                var answer = true;
                angular.forEach($scope.model.secrets, function (secret) {
                    var name = Kubernetes.getName(secret);
                    if (value === name) {
                        answer = false;
                    }
                });
                return answer;
            };
            $scope.checkFieldUnique = function (key) {
                return $scope.entity.properties[key] ? false : true;
            };
            $scope.hasAllKeys = function (keys) {
                var answer = keys && keys.length;
                angular.forEach(keys, function (key) {
                    if (!$scope.entity.properties[key]) {
                        answer = false;
                    }
                });
                return answer;
            };
            $scope.addFieldDialog = {
                controller: null,
                newReplicas: 0,
                dialog: new UI.Dialog(),
                onOk: function () {
                    $scope.addFieldDialog.dialog.close();
                    $scope.addDataField();
                },
                open: function (controller) {
                    var addFieldDialog = $scope.addFieldDialog;
                    addFieldDialog.dialog.open();
                    $timeout(function () {
                        $('#newDataName').focus();
                    }, 50);
                },
                close: function () {
                    $scope.addFieldDialog.dialog.close();
                }
            };
            $scope.entityChanged = function () {
                $scope.changed = true;
            };
            $scope.addFields = function (keys) {
                Kubernetes.log.info("Adding fields " + keys);
                angular.forEach(keys, function (key) { return addField(key); });
                Core.$apply($scope);
            };
            function addField(key) {
                var property = createProperty(key, "");
                $scope.entity.properties[key] = property;
                $scope.entity.newDataKey = "";
                $scope.showAddDataFieldForm = false;
                $scope.entityChanged();
                Kubernetes.log.info("Added key '" + key + "'");
            }
            $scope.addDataField = function () {
                var key = $scope.entity.newDataKey;
                if (key) {
                    addField(key);
                    Core.$apply($scope);
                }
            };
            $scope.deleteProperty = function (key) {
                if (key) {
                    delete $scope.entity.properties[key];
                    $scope.entityChanged();
                    Core.$apply($scope);
                }
            };
            $scope.cancel = function () {
                updateData();
            };
            $scope.save = function () {
                var entity = $scope.entity || {};
                var name = entity.name;
                if (name) {
                    if (!$scope.secret) {
                        $scope.secret = {
                            apiVersion: Kubernetes.defaultApiVersion,
                            kind: "Secret",
                            metadata: {
                                name: ""
                            },
                            data: {}
                        };
                    }
                    var data = {};
                    angular.forEach(entity.properties, function (property) {
                        var key = property.key;
                        var value = property.value || "";
                        if (key) {
                            data[key] = value.encodeBase64();
                        }
                    });
                    $scope.secret.metadata.name = name;
                    $scope.secret.data = data;
                    Core.notification('info', "Saving secret " + name);
                    kubeClient.put($scope.secret, function (data) {
                        var secretsLink = Developer.namespaceLink($scope, $routeParams, "secrets");
                        $location.path(secretsLink);
                    }, function (err) {
                        Core.notification('error', "Failed to secret " + name + "\n" + err);
                    });
                }
            };
            updateData();
            function createProperty(key, text) {
                var label = secretLabels[key] || key.humanize();
                var tooltip = secretTooltips[key] || "Value of the " + label;
                var rows = 5;
                var lines = text.split("\n").length + 1;
                if (lines > rows) {
                    rows = lines;
                }
                var type = "textarea";
                if (key === "username") {
                    type = "text";
                    if (!text) {
                        text = Kubernetes.currentUserName();
                    }
                }
                else if (key === "password") {
                    type = "password";
                }
                var property = {
                    key: key,
                    label: label,
                    tooltip: tooltip,
                    rows: rows,
                    value: text,
                    type: type
                };
                return property;
            }
            function updateData() {
                $scope.item = null;
                $scope.changed = false;
                $scope.entity = {
                    name: $scope.id,
                    properties: {}
                };
                if ($scope.id) {
                    angular.forEach($scope.model.secrets, function (secret) {
                        var name = Kubernetes.getName(secret);
                        if (name === $scope.id) {
                            $scope.secret = secret;
                            angular.forEach(secret.data, function (value, key) {
                                var text = "";
                                if (angular.isString(value) && value) {
                                    text = value.decodeBase64();
                                }
                                var property = createProperty(key, text);
                                $scope.entity.properties[key] = property;
                            });
                            $scope.fetched = true;
                            Core.$apply($scope);
                        }
                    });
                }
                else {
                    $scope.fetched = true;
                    Core.$apply($scope);
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
/// <reference path="utilHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.SecretsController = Kubernetes.controller("SecretsController", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesPods, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location, localStorage, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.$on('kubernetesModelUpdated', function () {
                Core.$apply($scope);
            });
            $scope.$createSecretLink = Developer.namespaceLink($scope, $routeParams, "secretCreate");
            var kubeClient = Kubernetes.createKubernetesClient("secrets");
            $scope.tableConfig = {
                data: 'model.secrets',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    {
                        field: '_key',
                        displayName: 'Name',
                        defaultSort: true,
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    {
                        field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    },
                ]
            };
            $scope.deletePrompt = function (selected) {
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: 'metadata.name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    kubeClient.delete(next, function () {
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                                else {
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete Secrets',
                    action: 'The following Secrets will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ServiceController = Kubernetes.controller("ServiceController", ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.rawMode = false;
            $scope.rawModel = null;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.itemConfig = {
                properties: {
                    '^\\/labels$': {
                        template: $templateCache.get('labelTemplate.html')
                    }
                }
            };
            $scope.$on('kubernetesModelUpdated', function () {
                updateData();
            });
            $scope.$watch('model.services', function (newValue, oldValue) {
                updateData();
            }, true);
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            $scope.flipRaw = function () {
                $scope.rawMode = !$scope.rawMode;
                Core.$apply($scope);
            };
            updateData();
            function updateData() {
                $scope.id = $routeParams["id"];
                $scope.namespace = $routeParams["namespace"] || KubernetesState.selectedNamespace;
                $scope.item = $scope.model.getService($scope.namespace, $scope.id);
                if ($scope.item) {
                    $scope.rawModel = Kubernetes.toRawJson($scope.item);
                }
                Core.$apply($scope);
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ServiceEditController = Kubernetes.controller("ServiceEditController", ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "SchemaRegistry",
        function ($scope, KubernetesModel, KubernetesState, KubernetesSchema, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL, schemas) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            $scope.id = $routeParams["id"];
            $scope.schema = KubernetesSchema;
            $scope.config = schemas.cloneSchema("io.fabric8.kubernetes.api.model.Service");
            //$scope.config = KubernetesSchema.definitions.kubernetes_v1beta2_Service;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.$on('$routeUpdate', function ($event) {
                updateData();
            });
            updateData();
            function updateData() {
                if ($scope.id) {
                    $scope.entity = $scope.model.getService(KubernetesState.selectedNamespace, $scope.id);
                    Core.$apply($scope);
                    $scope.fetched = true;
                }
                else {
                    $scope.fetched = true;
                }
            }
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module.factory('ServiceRegistry', [function () {
            return new ServiceRegistryService();
        }]);
    /**
     * Represents a simple interface to service discovery that can be used early on in the application lifecycle before the
     * underlying model has been created via dependency injection
     */
    var ServiceRegistryService = (function () {
        function ServiceRegistryService() {
            this.model = null;
        }
        /**
         * Returns true if there is a service available for the given ID or false
         */
        ServiceRegistryService.prototype.hasService = function (serviceName) {
            return this.findService(serviceName) ? true : false;
        };
        /**
         * Returns the service for the given service name (ID) or null if it cannot be found
         *
         * @param serviceName the name of the service to look for
         * @return {null}
         */
        ServiceRegistryService.prototype.findService = function (serviceName) {
            var answer = null;
            if (serviceName) {
                var model = this.getModel();
                if (model) {
                    var namespace = model.currentNamespace();
                    return model.getService(namespace, serviceName);
                }
            }
            return answer;
        };
        /**
         * Returns the service link for the given service name
         *
         * @param serviceName the name of the service
         * @return {null}
         */
        ServiceRegistryService.prototype.serviceLink = function (serviceName) {
            var service = this.findService(serviceName);
            return Kubernetes.serviceLinkUrl(service);
        };
        /**
         * Returns the service link for the given service name if its ready (has at least one ready pod)
         *
         * @param serviceName the name of the service
         * @return {null}
         */
        ServiceRegistryService.prototype.serviceReadyLink = function (serviceName) {
            var service = this.findService(serviceName);
            if (Kubernetes.readyPodCount(service)) {
                return Kubernetes.serviceLinkUrl(service);
            }
            else {
                return null;
            }
        };
        ServiceRegistryService.prototype.getModel = function () {
            var answer = this.model;
            // lets allow lazy load so we can be invoked before the injector has been created
            if (!answer) {
                var injector = HawtioCore.injector;
                if (injector) {
                    this.model = injector.get('KubernetesModel');
                }
            }
            answer = this.model;
            return answer;
        };
        return ServiceRegistryService;
    }());
    Kubernetes.ServiceRegistryService = ServiceRegistryService;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.ServiceApps = Kubernetes._module.controller('Kubernetes.ServiceApps', ["$scope", "KubernetesModel", function ($scope, KubernetesModel) {
        $scope.model = KubernetesModel;
    }]);
    Kubernetes.Services = Kubernetes.controller("Services", ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
        function ($scope, KubernetesModel, KubernetesServices, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, $http, $timeout, KubernetesApiURL) {
            $scope.kubernetes = KubernetesState;
            $scope.model = KubernetesModel;
            ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');
            $scope.tableConfig = {
                data: 'model.services',
                showSelectionCheckbox: true,
                enableRowClickSelection: false,
                multiSelect: true,
                selectedItems: [],
                filterOptions: {
                    filterText: $location.search()["q"] || ''
                },
                columnDefs: [
                    { field: '_key',
                        displayName: 'Name',
                        cellTemplate: $templateCache.get("idTemplate.html")
                    },
                    { field: '$serviceUrl',
                        displayName: 'Address',
                        cellTemplate: $templateCache.get("portalAddress.html")
                    },
                    { field: '$podCount',
                        displayName: 'Pods',
                        cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html"),
                        customSortField: function (field) {
                            // need to concat all the pod counters
                            var ready = field.$podCounters.ready || 0;
                            var valid = field.$podCounters.valid || 0;
                            var waiting = field.$podCounters.waiting || 0;
                            var error = field.$podCounters.error || 0;
                            return ready + valid + waiting + error;
                        }
                    },
                    { field: '$selectorText',
                        displayName: 'Selector',
                        cellTemplate: $templateCache.get("selectorTemplate.html")
                    },
                    { field: '$labelsText',
                        displayName: 'Labels',
                        cellTemplate: $templateCache.get("labelTemplate.html")
                    }
                ]
            };
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            $scope.deletePrompt = function (selected) {
                if (angular.isString(selected)) {
                    selected = [{
                            id: selected
                        }];
                }
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: 'metadata.name',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (next) {
                                    Kubernetes.log.debug("deleting: ", Kubernetes.getName(next));
                                    KubernetesServices.delete({
                                        id: Kubernetes.getName(next)
                                    }, undefined, function () {
                                        Kubernetes.log.debug("deleted: ", Kubernetes.getName(next));
                                        deleteSelected(selected, selected.shift());
                                    }, function (error) {
                                        Kubernetes.log.debug("Error deleting: ", error);
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete services?',
                    action: 'The following services will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    // controller for the status icon cell
    Kubernetes.PodStatus = Kubernetes.controller("PodStatus", ["$scope", function ($scope) {
            $scope.statusMapping = function (text) {
                return Kubernetes.statusTextToCssClass(text);
            };
        }]);
    Kubernetes._module.controller("Kubernetes.TermController", ["$scope", "TerminalService", function ($scope, TerminalService) {
        $scope.canConnectTo = function (container) {
            if (container.securityContext && container.securityContext.privileged) {
                return false;
            }
            return true;
        };
        $scope.openTerminal = function (selfLink, containerName) {
            var id = TerminalService.newTerminal(selfLink, containerName);
            Kubernetes.log.debug("Created terminal, id: ", id);
        };
    }]);
    // controller that deals with the labels per pod
    Kubernetes.Labels = Kubernetes.controller("Labels", ["$scope", "$location", function ($scope, $location) {
            $scope.labels = [];
            var labelKeyWeights = {
                "name": 1,
                "replicationController": 2,
                "group": 3
            };
            $scope.$watch('entity', function (newValue, oldValue) {
                if (newValue) {
                    // log.debug("labels: ", newValue);
                    // massage the labels a bit
                    $scope.labels = [];
                    angular.forEach(Core.pathGet($scope.entity, ["metadata", "labels"]), function (value, key) {
                        if (key === 'fabric8') {
                            // TODO not sure what this is for, the container type?
                            return;
                        }
                        $scope.labels.push({
                            key: key,
                            title: value
                        });
                    });
                    //  lets sort by key but lets make sure that we weight certain labels so they are first
                    $scope.labels = $scope.labels.sort(function (a, b) {
                        function getWeight(key) {
                            return labelKeyWeights[key] || 1000;
                        }
                        var n1 = a["key"];
                        var n2 = b["key"];
                        var w1 = getWeight(n1);
                        var w2 = getWeight(n2);
                        var diff = w1 - w2;
                        if (diff < 0) {
                            return -1;
                        }
                        else if (diff > 0) {
                            return 1;
                        }
                        if (n1 && n2) {
                            if (n1 > n2) {
                                return 1;
                            }
                            else if (n1 < n2) {
                                return -1;
                            }
                            else {
                                return 0;
                            }
                        }
                        else {
                            if (n1 === n2) {
                                return 0;
                            }
                            else if (n1) {
                                return 1;
                            }
                            else {
                                return -1;
                            }
                        }
                    });
                }
            });
            $scope.handleClick = function (entity, labelType, value) {
                // log.debug("handleClick, entity: ", entity, " key: ", labelType, " value: ", value);
                var filterTextSection = labelType + "=" + value.title;
                $scope.$emit('labelFilterUpdate', filterTextSection);
            };
            $scope.labelClass = Kubernetes.containerLabelClass;
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module.directive("hawtioTabs", function () {
        return {
            templateUrl: Kubernetes.templatePath + 'tabs.html'
        };
    });
})(Kubernetes || (Kubernetes = {}));

/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.TemplateController = Kubernetes.controller("TemplateController", [
        "$scope", "$location", "$http", "$timeout", "$routeParams", "marked", "$templateCache", "$modal", "KubernetesModel", "KubernetesState", "KubernetesApiURL",
        function ($scope, $location, $http, $timeout, $routeParams, marked, $templateCache, $modal, KubernetesModel, KubernetesState, KubernetesApiURL) {
            var model = $scope.model = KubernetesModel;
            $scope.filterText = $location.search()["q"];
            // $scope.watch = watches[WatchTypes.TEMPLATES];
            $scope.targetNamespace = $routeParams.targetNamespace;
            Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
            // reloadDataIfNoWatch();
            $scope.$watchCollection('model.namespaces', function () {
                if (!$scope.targetNamespace) {
                    $scope.targetNamespace = model.currentNamespace();
                }
            });
            var returnTo = new URI($location.search()['returnTo'] || '/kubernetes/apps');
            function goBack() {
                $location.path(returnTo.path()).search(returnTo.query(true));
            }
            function getAnnotations(obj) {
                return Core.pathGet(obj, ['metadata', 'annotations']);
            }
            function getValueFor(obj, key) {
                var annotations = getAnnotations(obj);
                if (!annotations) {
                    return "";
                }
                var name = Kubernetes.getName(obj);
                if (name) {
                    var fullKey = "fabric8." + name + "/" + key;
                    var answer = annotations[fullKey];
                    if (answer) {
                        return answer;
                    }
                }
                var key = _.find(_.keys(annotations), function (k) { return _.endsWith(k, key); });
                if (key) {
                    return annotations[key];
                }
                else {
                    return "";
                }
            }
            $scope.cancel = function () {
                if ($scope.formConfig) {
                    delete $scope.formConfig;
                    delete $scope.entity;
                    $scope.objects = undefined;
                    return;
                }
                goBack();
            };
            /*
            $scope.$watch('model.templates.length', (newValue) => {
              if (newValue === 0) {
                goBack();
              }
            });
            */
            $scope.filterTemplates = function (template) {
                if (Core.isBlank($scope.filterText)) {
                    return true;
                }
                return _.contains(angular.toJson(template), $scope.filterText.toLowerCase());
            };
            $scope.openFullDescription = function (template) {
                var text = marked(getValueFor(template, 'description') || 'No description');
                var modal = $modal.open({
                    templateUrl: UrlHelpers.join(Kubernetes.templatePath, 'templateDescription.html'),
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.text = text,
                                $scope.ok = function () {
                                    modal.close();
                                };
                        }]
                });
            };
            $scope.getDescription = function (template) {
                var answer = $(marked(getValueFor(template, 'description') || 'No description'));
                var textDefault = answer.html();
                var maxLength = 200;
                if (textDefault.length > maxLength) {
                    var truncated = $.trim(textDefault).substring(0, maxLength).split(' ').slice(0, -1).join(' ');
                    answer.html(truncated + '...');
                    answer.append($templateCache.get('truncatedDescriptionTag.html'));
                }
                return answer.html();
            };
            $scope.getIconUrl = function (template) {
                return getValueFor(template, 'iconUrl') || Kubernetes.defaultIconUrl;
            };
            $scope.deployTemplate = function (template) {
                Kubernetes.log.debug("Template parameters: ", template.parameters);
                Kubernetes.log.debug("Template objects: ", template.objects);
                Kubernetes.log.debug("Template annotations: ", template.metadata.annotations);
                var templateAnnotations = template.metadata.annotations;
                if (templateAnnotations) {
                    _.forEach(template.objects, function (object) {
                        var annotations = object.metadata.annotations || {};
                        var name = Kubernetes.getName(object);
                        var matches = _.filter(_.keys(templateAnnotations), function (key) { return key.match('.' + name + '/'); });
                        matches.forEach(function (match) {
                            if (!(match in annotations)) {
                                annotations[match] = templateAnnotations[match];
                            }
                        });
                        object.metadata.annotations = annotations;
                    });
                }
                var routeServiceName = undefined;
                var service = _.find(template.objects, function (obj) {
                    if (Kubernetes.getKind(obj) === "Service") {
                        var ports = Kubernetes.getPorts(obj);
                        if (ports && ports.length === 1) {
                            return true;
                        }
                    }
                    else {
                        return false;
                    }
                });
                if (service) {
                    routeServiceName = Kubernetes.getName(service);
                }
                Kubernetes.log.debug("Service: ", service);
                if ((!routeServiceName || !Kubernetes.isOpenShift) && (!template.parameters || template.parameters.length === 0)) {
                    Kubernetes.log.debug("No parameters required, deploying objects");
                    applyObjects(template.objects);
                    return;
                }
                var formConfig = {
                    style: HawtioForms.FormStyle.STANDARD,
                    hideLegend: true,
                    properties: {}
                };
                var params = template.parameters;
                _.forEach(params, function (param) {
                    var property = {};
                    property.label = param.name.titleize();
                    property.description = param.description;
                    property.default = param.value;
                    // TODO, do parameters support types?
                    property.type = 'string';
                    formConfig.properties[param.name] = property;
                });
                if (routeServiceName && Kubernetes.isOpenShift) {
                    formConfig.properties.createRoute = {
                        type: 'boolean',
                        default: true,
                        label: "Create Route"
                    };
                    /*
                            formConfig.properties.routeName = {
                              type: 'string',
                              label: 'Route Name',
                              default: routeServiceName,
                              'control-group-attributes': {
                                'ng-show': 'entity.createRoute'
                              }
                            };
                    */
                    formConfig.properties.routeServiceName = {
                        type: 'hidden',
                        default: routeServiceName
                    };
                    var namespace = Kubernetes.currentKubernetesNamespace();
                    // TODO store this in localStorage!
                    var domain = "vagrant.f8";
                    var defaultRouteHostSuffix = '.' + (namespace === "default" ? "" : namespace + ".") + domain;
                    formConfig.properties.routeHostname = {
                        type: 'string',
                        default: defaultRouteHostSuffix,
                        label: "Route host name suffix",
                        'control-group-attributes': {
                            'ng-show': 'entity.createRoute'
                        }
                    };
                }
                $scope.entity = {};
                $scope.formConfig = formConfig;
                $scope.objects = template.objects;
                Kubernetes.log.debug("Form config: ", formConfig);
            };
            function substitute(str, data) {
                return str.replace(/\${\w*}/g, function (match) {
                    var key = match.replace(/\${/, '').replace(/}/, '').trim();
                    return data[key] || match;
                });
            }
            ;
            $scope.substituteAndDeployTemplate = function () {
                var objects = $scope.objects;
                var objectsText = angular.toJson(objects, true);
                // pull these out of the entity object so they're not used in substitutions
                var createRoute = $scope.entity.createRoute;
                var routeHostnameSuffix = $scope.entity.routeHostname || "";
                var routeName = $scope.entity.routeName;
                var routeServiceName = $scope.entity.routeServiceName;
                delete $scope.entity.createRoute;
                delete $scope.entity.routeHostname;
                delete $scope.entity.routeName;
                delete $scope.entity.routeServiceName;
                objectsText = substitute(objectsText, $scope.entity);
                objects = angular.fromJson(objectsText);
                if (createRoute) {
                    var routes = [];
                    angular.forEach(objects, function (object) {
                        var kind = object.kind;
                        var name = Kubernetes.getName(object);
                        if (name && "Service" === kind) {
                            var routeHostname = name + routeHostnameSuffix;
                            var route = {
                                kind: "Route",
                                apiVersion: Kubernetes.defaultOSApiVersion,
                                metadata: {
                                    name: name,
                                },
                                spec: {
                                    host: routeHostname,
                                    to: {
                                        kind: "Service",
                                        name: name
                                    }
                                }
                            };
                            routes.push(route);
                        }
                    });
                    objects = objects.concat(routes);
                }
                if ($scope.targetNamespace !== model.currentNamespace()) {
                    $scope.$on('WatcherNamespaceChanged', function () {
                        Kubernetes.log.debug("Namespace changed");
                        setTimeout(function () {
                            // reloadDataIfNoWatch();
                            applyObjects(objects);
                            Core.$apply($scope);
                        }, 500);
                    });
                    Core.notification('info', "Switching to namespace " + $scope.targetNamespace + " and deploying template");
                    model.kubernetes.selectedNamespace = $scope.targetNamespace;
                }
                else {
                    applyObjects(objects);
                }
            };
            function applyObjects(objects) {
                _.forEach(objects, function (object) {
                    Kubernetes.log.debug("Object: ", object);
                    Kubernetes.updateOrCreateObject(object, KubernetesModel);
                });
                goBack();
            }
            $scope.deleteTemplate = function (template) {
                UI.multiItemConfirmActionDialog({
                    collection: [template],
                    index: 'metadata.name',
                    onClose: function (result) {
                        if (result) {
                            KubernetesModel['templatesResource'].delete({
                                id: template.metadata.name
                            }, undefined, function () {
                                KubernetesModel['templatesResource'].query(function (data) {
                                    KubernetesModel.templates = data.items;
                                });
                            }, function (error) {
                                Kubernetes.log.debug("Error deleting template: ", error);
                            });
                        }
                    },
                    title: 'Delete Template?',
                    action: 'The following template will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            /*
            function reloadDataIfNoWatch() {
              if (!$scope.watch || !$scope.watch.connected) {
                // TODO register a handler of bad watches so we invoke this in a polling form automatically?
                model.templatesResource.query((response) => {
                  if (response) {
                    var items = response.items;
                    model.templates = items;
                    Core.$apply($scope);
                  }
                });
              }
            }
            */
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="kubernetesPlugin.ts"/>
var Kubernetes;
(function (Kubernetes) {
    var log = Logger.get('kubernetes-watcher');
    var k8sTypes = KubernetesAPI.NamespacedTypes.k8sTypes;
    var osTypes = KubernetesAPI.NamespacedTypes.osTypes;
    var self = {};
    var updateFunction = function () {
        log.debug("Objects changed, firing listeners");
        var objects = {};
        _.forEach(self.getTypes(), function (type) {
            objects[type] = self.getObjects(type);
        });
        _.forEach(self.listeners, function (listener) {
            listener(objects);
        });
    };
    var debouncedUpdate = _.debounce(updateFunction, 500, { trailing: true });
    var namespaceWatch = {
        selected: undefined,
        watch: undefined,
        objects: [],
        objectMap: {},
        watches: {}
    };
    hawtioPluginLoader.registerPreBootstrapTask({
        name: 'KubernetesWatcherInit',
        depends: ['KubernetesApiDiscovery'],
        task: function (next) {
            var booted = false;
            if (Kubernetes.isOpenShift) {
                log.info("Backend is an Openshift instance");
            }
            else {
                log.info("Backend is a vanilla Kubernetes instance");
            }
            namespaceWatch.watch = KubernetesAPI.watch({
                kind: KubernetesAPI.WatchTypes.NAMESPACES,
                success: function (objects) {
                    namespaceWatch.objects = objects;
                    if (!booted) {
                        booted = true;
                        self.setNamespace(localStorage[Kubernetes.Constants.NAMESPACE_STORAGE_KEY] || Kubernetes.defaultNamespace);
                        next();
                    }
                    log.debug("Got namespaces: ", namespaceWatch.objects);
                }, error: function (error) {
                    log.warn("Error fetching namespaces: ", error);
                    // TODO is this necessary?
                    //HawtioOAuth.doLogout();
                    if (!booted) {
                        booted = true;
                        next();
                    }
                }
            });
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: 'KubernetesApiDiscovery',
        depends: ['hawtio-oauth'],
        task: function (next) {
            Kubernetes.isOpenShift = false;
            var userProfile = HawtioOAuth.getUserProfile();
            log.debug("User profile: ", userProfile);
            if (userProfile && userProfile.provider === "hawtio-google-oauth") {
                log.debug("Possibly running on GCE");
                // api master is on GCE
                $.ajax({
                    url: UrlHelpers.join(Kubernetes.masterApiUrl(), 'api', 'v1', 'namespaces'),
                    complete: function (jqXHR, textStatus) {
                        if (textStatus === "success") {
                            log.debug("jqXHR: ", jqXHR);
                            userProfile.oldToken = userProfile.token;
                            userProfile.token = undefined;
                            $.ajaxSetup({
                                beforeSend: function (request) {
                                }
                            });
                        }
                        next();
                    },
                    beforeSend: function (request) {
                    }
                });
            }
            else {
                log.debug("Not running on GCE");
                // double-check if we're on vanilla k8s or openshift
                var rootUri = new URI(Kubernetes.masterApiUrl()).path("/oapi").query("").toString();
                log.debug("Checking for an openshift backend");
                HawtioOAuth.authenticatedHttpRequest({
                    url: rootUri,
                    success: function (data) {
                        if (data) {
                            Kubernetes.isOpenShift = true;
                        }
                        next();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        var error = KubernetesAPI.getErrorObject(jqXHR);
                        if (!error) {
                            log.debug("Failed to find root paths: ", textStatus, ": ", errorThrown);
                        }
                        else {
                            log.debug("Failed to find root paths: ", error);
                        }
                        Kubernetes.isOpenShift = false;
                        next();
                    }
                });
            }
        }
    });
    // TODO this needs to go over into KubernetesAPI
    function namespaced(kind) {
        switch (kind) {
            case KubernetesAPI.WatchTypes.POLICIES:
            case KubernetesAPI.WatchTypes.OAUTH_CLIENTS:
            case KubernetesAPI.WatchTypes.NODES:
            case KubernetesAPI.WatchTypes.PERSISTENT_VOLUMES:
            case KubernetesAPI.WatchTypes.PROJECTS:
                return false;
            default:
                return true;
        }
    }
    self.setNamespace = function (namespace) {
        if (namespaceWatch.selected) {
            log.debug("Stopping current watches");
            _.forOwn(namespaceWatch.watches, function (watch, key) {
                log.debug("Disconnecting watch: ", key);
                watch.disconnect();
            });
            _.forEach(_.keys(namespaceWatch.watches), function (key) {
                log.debug("Deleting kind: ", key);
                delete namespaceWatch.watches[key];
            });
        }
        namespaceWatch.selected = namespace;
        if (namespace) {
            _.forEach(self.getTypes(), function (kind) {
                if (kind === KubernetesAPI.WatchTypes.NAMESPACES) {
                    return;
                }
                var watch = KubernetesAPI.watch({
                    kind: kind,
                    namespace: namespaced(kind) ? namespace : undefined,
                    success: function (objects) {
                        watch.objects = objects;
                        debouncedUpdate();
                    }
                });
                namespaceWatch.watches[kind] = watch;
            });
        }
    };
    self.hasWebSocket = true;
    self.getNamespace = function () { return namespaceWatch.selected; };
    self.getTypes = function () {
        var filter = function (kind) {
            // filter out stuff we don't care about yet
            switch (kind) {
                case KubernetesAPI.WatchTypes.OAUTH_CLIENTS:
                case KubernetesAPI.WatchTypes.IMAGE_STREAMS:
                case KubernetesAPI.WatchTypes.POLICIES:
                case KubernetesAPI.WatchTypes.ROLES:
                case KubernetesAPI.WatchTypes.ROLE_BINDINGS:
                    return false;
                default:
                    return true;
            }
        };
        var answer = k8sTypes.concat([Kubernetes.WatchTypes.NAMESPACES]);
        if (Kubernetes.isOpenShift) {
            answer = answer.concat(osTypes);
        }
        return _.filter(answer, filter);
    };
    self.getObjects = function (kind) {
        if (kind === Kubernetes.WatchTypes.NAMESPACES) {
            return namespaceWatch.objects;
        }
        if (kind in namespaceWatch.watches) {
            return namespaceWatch.watches[kind].objects;
        }
        else {
            return undefined;
        }
    };
    self.listeners = [];
    // listener gets notified after a bunch of changes have occurred
    self.registerListener = function (fn) {
        self.listeners.push(fn);
    };
    Kubernetes._module.service('WatcherService', ['userDetails', '$rootScope', '$timeout', function (userDetails, $rootScope, $timeout) {
            return self;
        }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="watcher.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module.config(["kubernetesContainerSocketProvider", function (kubernetesContainerSocketProvider) {
        kubernetesContainerSocketProvider.WebSocketFactory = "CustomWebSockets";
    }]);
    Kubernetes._module.factory('CustomWebSockets', ["userDetails", function (userDetails) {
        return function CustomWebSocket(url, protocols) {
            var paths = url.split('?');
            if (!_.startsWith(paths[0], Kubernetes.masterApiUrl())) {
                paths[0] = UrlHelpers.join(Kubernetes.masterApiUrl(), paths[0]);
            }
            url = KubernetesAPI.wsUrl(paths[0]);
            url.search(paths[1] + '&access_token=' + userDetails.token);
            Kubernetes.log.debug("Using ws url: ", url.toString());
            return new WebSocket(url.toString(), protocols);
        };
    }]);
    Kubernetes._module.service('TerminalService', ["$rootScope", "$document", "$compile", "$templateCache", function ($rootScope, $document, $compile, $templateCache) {
        var body = $document.find('body');
        function positionTerminals(terminals) {
            var total = _.keys(terminals).length;
            var dist = (body.width() - 225) / total;
            var position = 5;
            angular.forEach(terminals, function (value, key) {
                value.el.css('left', position + 'px');
                position = position + dist;
            });
        }
        var self = {
            terminals: {},
            newTerminal: function (podLink, containerName) {
                var terminalId = UrlHelpers.join(podLink, containerName);
                if (terminalId in self.terminals) {
                    Kubernetes.log.debug("Already a terminal with id: ", terminalId);
                    return terminalId;
                }
                var scope = $rootScope.$new();
                scope.podLink = podLink;
                scope.containerName = containerName;
                scope.id = terminalId;
                var template = $templateCache.get(UrlHelpers.join(Kubernetes.templatePath, 'termShell.html'));
                var el = $($compile(template)(scope));
                var term = {
                    scope: scope,
                    el: el
                };
                body.append(el);
                self.terminals[terminalId] = term;
                positionTerminals(self.terminals);
                return terminalId;
            },
            closeTerminal: function (id) {
                var term = self.terminals[id];
                if (term) {
                    term.el.remove();
                    delete self.terminals[id];
                    positionTerminals(self.terminals);
                }
            },
            raiseTerminal: function (id) {
                angular.forEach(self.terminals, function (value, key) {
                    if (key === id) {
                        value.el.css('z-index', '4000');
                    }
                    else {
                        value.el.css('z-index', '3000');
                    }
                });
            }
        };
        return self;
    }]);
    Kubernetes._module.directive('terminalWindow', ["$compile", "TerminalService", function ($compile, TerminalService) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attr) {
                scope.close = function () {
                    TerminalService.closeTerminal(scope.id);
                };
                scope.raise = function () {
                    TerminalService.raiseTerminal(scope.id);
                };
                scope.minimize = function () {
                    element.toggleClass('minimized');
                };
                Kubernetes.log.debug("element: ", element);
                var body = element.find('.terminal-body');
                Kubernetes.log.debug("body: ", body);
                body.append($compile('<kubernetes-container-terminal pod="podLink" container="containerName" command="bash"></kubernetes-container-terminal>')(scope));
            }
        };
    }]);
})(Kubernetes || (Kubernetes = {}));


angular.module("hawtio-kubernetes-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/developer/html/code.html","<div ng-controller=\"Kubernetes.BuildConfigController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.tools.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter tools...\"></hawtio-filter>\n      </span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"entity.tools.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no tools currently available.</p>\n        </div>\n        <div ng-show=\"entity.tools.length\">\n          <div ng-hide=\"entity.tools.length\" class=\"align-center\">\n            <p class=\"alert alert-info\">There are no tools currently available.</p>\n          </div>\n          <div ng-repeat=\"env in entity.tools | filter:filterTemplates | orderBy:\'label\' track by $index\">\n            <div class=\"row\"\n                 title=\"{{env.description}}\">\n              <div class=\"col-md-9\">\n                <a href=\"{{env.url}}\">\n                  <h3>\n                    <i class=\"{{env.iconClass}}\"></i>\n                    {{env.label}}\n                  </h3>\n                </a>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/environment.html","environment!!!!");
$templateCache.put("plugins/developer/html/environments.html","<div ng-controller=\"Developer.ProjectController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.environments.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter environments...\"></hawtio-filter>\n      </span>\n    </div>\n  </div>\n  <div ng-hide=\"model.fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div ng-show=\"model.fetched\">\n    <div ng-hide=\"entity.environments.length\" class=\"align-center row\">\n      <div class=\"col-md-12\">\n        <p class=\"alert alert-info\">There are no environments currently available.</p>\n      </div>\n    </div>\n\n    <div ng-show=\"entity.environments.length\">\n\n      <div class=\"pull-right\" n>\n        <a href=\"{{entity.$build.url}}\" class=\"btn btn-default\" target=\"browse\">\n          <i class=\"{{entity.$build.iconClass}}\"></i>\n          {{entity.$build.label}}\n        </a>\n      </div>\n\n      <div class=\"row\">\n        <h4 class=\"project-overview-title\">Environments</h4>\n      </div>\n\n      <div class=\"row\" title=\"{{env.description}}\">\n        <div class=\"col-md-12 environment-rows\">\n          <div ng-repeat=\"env in entity.environments | filter:filterTemplates track by $index\"\n               class=\"inline-block environment-block\">\n            <div class=\"environment-row\">\n              <div class=\"environment-name-block\">\n                <a href=\"{{env.url}}\" title=\"namespace: {{env.namespace}}\">\n                  <h3>\n                    <i class=\"{{env.iconClass}}\"></i>&nbsp;\n                    {{env.label}}\n                  </h3>\n                </a>\n              </div>\n              <div class=\"environment-deploy-block\"\n                   ng-repeat=\"(project, versions) in envVersions[env.namespace] | orderBy:\'project\' track by $index\">\n                <div ng-repeat=\"(version, versionInfo) in versions.versions | orderBy:\'version\' track by $index\">\n                  <div ng-repeat=\"(rcname, rc) in versionInfo.replicationControllers\">\n                    <div class=\"environment-deploy-version-and-pods\">\n                      <a href=\"{{rc.$viewLink}}\" ng-show=\"rc.$viewLink\"\n                         title=\"View the Replication Controller from project {{project}} of version {{version}}\">\n                        <i class=\"fa fa-cubes\"></i>\n                        {{rc.$name}}\n                        : {{version}}\n                      </a>\n                      <span ng-hide=\"rc.$viewLink\"\n                            title=\"View the Replication Controller from project {{project}} of version {{version}}\">\n                        <i class=\"fa fa-cubes\"></i>\n                        {{rc.$name}}\n                        : {{version}}\n                      </span>\n                      &nbsp;\n                      &nbsp;\n                      &nbsp;\n                    <span class=\"pull-right\">\n                      <a ng-show=\"rc.$podCounters.podsLink\" href=\"{{rc.$podCounters.podsLink}}\" title=\"View pods\">\n                        <span ng-show=\"rc.$podCounters.ready\"\n                              class=\"badge badge-success\">{{rc.$podCounters.ready}}</span>\n                        <span ng-show=\"rc.$podCounters.valid\"\n                              class=\"badge badge-info\">{{rc.$podCounters.valid}}</span>\n                        <span ng-show=\"rc.$podCounters.waiting\" class=\"badge\">{{rc.$podCounters.waiting}}</span>\n                        <span ng-show=\"rc.$podCounters.error\"\n                              class=\"badge badge-warning\">{{rc.$podCounters.error}}</span>\n                      </a>\n                    </span>\n                    </div>\n                    <div class=\"environment-deploy-build-info\">\n                      <a href=\"{{rc.$buildUrl}}\" target=\"builds\" ng-show=\"rc.$buildUrl && rc.$buildId\" class=\"=\"\n                         title=\"View the build which created this Replication Controller\">\n                        <i class=\"fa fa-tasks\"></i>\n                        Build #{{rc.$buildId}}\n                      </a>\n                      &nbsp;\n                      &nbsp;\n                      &nbsp;\n                      <a href=\"{{rc.$gitUrl}}\" target=\"git\" ng-show=\"rc.$gitUrl\" class=\"pull-right\"\n                         title=\"View the source code for the commit which created this Replication Controller - commit: {{rc.$gitCommit}}\">\n                        <i class=\"fa fa-code-fork\"></i>\n                        Commit {{rc.$gitCommit | limitTo:7}}\n                      </a>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"row\">\n        <h4 class=\"project-overview-title\"><a ng-href=\"{{$projectLink}}/jenkinsJob/{{jobId}}/pipelines\">Pipelines</a></h4>\n      </div>\n    </div>\n\n  </div>\n\n  <div>\n    <ng-include src=\"\'pendingPipelines.html\'\"/>\n  </div>\n\n  <div ng-controller=\"Developer.JenkinsLogController\">\n    <div ng-show=\"selectedBuild.$jobId && selectedBuild.id\"\n         title=\"logs for job: {{selectedBuild.$jobId}} build: {{selectedBuild.id}}\">\n      <div>\n        <div class=\"row\">\n          <h4 class=\"project-overview-title\"><a ng-href=\"{{$projectLink}}/jenkinsJob/{{jobId}}/log/{{selectedBuild.id}}\">Logs</a></h4>\n        </div>\n\n        <div class=\"log-panel\" scroll-glue>\n          <div class=\"log-panel-inner\">\n            <p ng-repeat=\"log in log.logs track by $index\" ng-bind-html=\"log | asTrustedHtml\"></p>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n\n<div ng-include=\"\'plugins/wiki/html/projectCommitsPanel.html\'\"></div>\n\n</div>\n");
$templateCache.put("plugins/developer/html/home.html","<div ng-controller=\"Developer.HomeController\">\n  <div class=\"jumbotron\">\n    <h1>Perspectives</h1>\n\n    <p>\n      Please choose the perspective you would like to use:\n    </p>\n  </div>\n  <div class=\"row\">\n\n    <div class=\"col-md-6\">\n      <p class=\"text-center\">\n        <a class=\"btn btn-lg btn-primary\" href=\"/workspaces\" role=\"button\"\n           title=\"Create or work on Projects\">\n          <i class=\"fa fa-tasks\"></i>\n          &nbspDevelop »\n        </a>\n      </p>\n\n      <p class=\"text-center\">\n        Work on projects and source code\n      </p>\n    </div>\n    <div class=\"col-md-6\">\n      <p class=\"text-center\">\n        <a class=\"btn btn-lg btn-primary\" href=\"/namespaces\" role=\"button\"\n           title=\"Look around the various Namespaces at running Pods and Services\">\n          <i class=\"fa fa-cubes\"></i>\n          &nbsp;Operate »\n        </a>\n      </p>\n\n      <p class=\"text-center\">\n        Manage and run Pods and Services\n      </p>\n    </div>\n  </div>\n</div>");
$templateCache.put("plugins/developer/html/jenkinsApproveModal.html","<div class=\"modal-header\">\n  <h3 class=\"modal-title\">{{operation}}?</h3>\n</div>\n<div class=\"modal-body\">\n  Are you sure you wish to {{operation}}?\n</div>\n<div class=\"modal-footer\">\n  <button class=\"btn btn-primary\" ng-click=\"ok()\">{{operation}}</button>\n  <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n</div>\n");
$templateCache.put("plugins/developer/html/jenkinsJob.html","<div class=\"row\" ng-controller=\"Developer.JenkinsJobController\">\n  <script type=\"text/ng-template\" id=\"jenkinsBuildIdTemplate.html\">\n    <div class=\"ngCellText\" title=\"{{row.entity.fullDisplayName}} {{row.entity.result}}\">\n      <a href=\"{{row.entity.$logsLink}}\" title=\"View the build logs\">\n        <i class=\"{{row.entity.$iconClass}}\"></i>&nbsp;&nbsp;{{row.entity.displayName}}\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsBuildButtonsTemplate.html\">\n    <div class=\"ngCellText\">\n      <a class=\"btn btn-default\" href=\"{{row.entity.$pipelineLink}}\" ng-show=\"row.entity.$pipelineLink\" target=\"View the pipeline for this build\">\n        <i class=\"fa fa-tasks\"></i> Pipeline\n      </a>\n      &nbsp;&nbsp;\n      <a class=\"btn btn-default\" href=\"{{row.entity.$logsLink}}\" ng-show=\"row.entity.$logsLink\" title=\"View the build logs\">\n        <i class=\"fa fa-tasks\"></i> Logs\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsBuildTimestampTemplate.html\">\n    <div class=\"ngCellText\" title=\"Build started at: {{row.entity.$timestamp}}\">\n      {{row.entity.$timestamp.relative()}}\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsBuildDurationTemplate.html\">\n    <div class=\"ngCellText\" title=\"Build took {{row.entity.$duration}} milliseconds\">\n      {{row.entity.$duration.duration()}}\n    </div>\n  </script>\n\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"job.builds.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter builds...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched\"\n              title=\"Delete this build history\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n\n      <a class=\"btn btn-primary pull-right\" ng-click=\"triggerBuild()\"\n         title=\"Trigger this build\">\n        <i class=\"fa fa-play-circle-o\"></i>  Trigger</a>\n      </a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"job.builds.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no builds in this job.</p>\n        </div>\n        <div ng-show=\"job.builds.length\">\n          <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/jenkinsJobs.html","<div class=\"row\" ng-controller=\"Developer.JenkinsJobsController\">\n  <script type=\"text/ng-template\" id=\"jenkinsJobNameTemplate.html\">\n    <div class=\"ngCellText\" title=\"{{row.entity.fullDisplayName}} {{row.entity.result}}\">\n      <a href=\"{{row.entity.$buildsLink}}\">\n        <i class=\"{{row.entity.$iconClass}}\"></i>&nbsp;&nbsp;{{row.entity.displayName}}\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsJobButtonsTemplate.html\">\n    <div class=\"ngCellText\">\n      <a class=\"btn btn-default\" href=\"{{row.entity.$pipelinesLink}}\" ng-show=\"row.entity.$pipelinesLink\" title=\"View the pipelines for this build\">\n        <i class=\"fa fa-tasks\"></i> Pipelines\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsBuildTimestampTemplate.html\">\n    <div class=\"ngCellText\" title=\"Build started at: {{row.entity.$timestamp}}\">\n      {{row.entity.$timestamp.relative()}}\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsBuildDurationTemplate.html\">\n    <div class=\"ngCellText\" title=\"Build took {{row.entity.$duration}} milliseconds\">\n      {{row.entity.$duration.duration()}}\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsLastSuccessTemplate.html\">\n    <div class=\"ngCellText\"  ng-init=\"success=row.entity.lastSuccessfulBuild\">\n      <span title=\"Build took {{success.$duration.duration()}} milliseconds\">\n      <span ng-show=\"success\">\n        {{success.$timestamp.relative()}}\n      </span>\n      <span ng-show=\"success.$buildLink\">\n        -\n        <a href=\"{{success.$buildLink}}\" target=\"build\" title=\"View the builds\">\n          {{success.displayName}}\n        </a>\n      </span>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"jenkinsLastFailureTemplate.html\">\n    <div class=\"ngCellText\" ng-init=\"fail=row.entity.lastFailedBuild\">\n      <span title=\"Build took {{fail.$duration.duration()}} milliseconds\">\n      <span ng-show=\"fail\">\n        {{fail.$timestamp.relative()}}\n      </span>\n      <span ng-show=\"fail.$buildLink\">\n        -\n        <a href=\"{{fail.$buildLink}}\" target=\"build\" title=\"View the builds\">\n          {{fail.displayName}}\n        </a>\n      </span>\n      </span>\n    </div>\n  </script>\n\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"jenkins.jobs.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter jobs...\"></hawtio-filter>\n      </span>\n      <a class=\"btn btn-primary pull-right\" ng-click=\"triggerBuild()\"\n         title=\"Trigger this build\">\n        <i class=\"fa fa-play-circle-o\"></i>  Trigger</a>\n      </a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"jenkins.jobs.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no jobs in this jenkins.</p>\n        </div>\n        <div ng-show=\"jenkins.jobs.length\">\n          <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/jenkinsLog.html","<div class=\"row\" ng-controller=\"Developer.JenkinsLogController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-model=\"log.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter logs...\"></hawtio-filter>\n      </span>\n      <a class=\"btn btn-default pull-right\" target=\"jenkins\" href=\"{{$viewJenkinsLogLink}}\" ng-show=\"$viewJenkinsLogLink\"\n         title=\"View this log inside Jenkins\">\n        <i class=\"fa fa-external-link\"></i>  Log in Jenkins</a>\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" target=\"jenkins\" href=\"{{$viewJenkinsBuildLink}}\" ng-show=\"$viewJenkinsBuildLink\"\n         title=\"View this build inside Jenkins\">\n        <i class=\"fa fa-external-link\"></i>  Build in Jenkins</a>\n      </a>\n    </div>\n  </div>\n  <div class=\"log-window\" scroll-glue>\n    <div class=\"log-window-inner\" >\n      <p ng-repeat=\"log in log.logs | filter:log.filterText track by $index\" ng-bind-html=\"log | asTrustedHtml\"></p>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/jenkinsMetrics.html","<div class=\"row\" ng-controller=\"Developer.JenkinsMetricsController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"metrics.builds.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no completed builds in this job.</p>\n        </div>\n        <div ng-show=\"metrics.builds.length\">\n          <nvd3 options=\"options\" data=\"data\" api=\"api\"></nvd3>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/pipeline.html","<div class=\"row\" ng-controller=\"Developer.PipelineController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"model.stages.length\"\n                       ng-model=\"model.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter pipeline...\"></hawtio-filter>\n      </span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.stages.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no pipeline stages in this build.</p>\n        </div>\n        <div ng-show=\"model.stages.length\">\n\n          <h2>Pipeline for {{jobId}}</h2>\n\n          <div pipeline-view></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/pipelineView.html","<div class=\"pipeline-block\">\n  <div class=\"pipeline-build inline-block\"\n       title=\"{{build.description || \'Pipeline build number \' + build.displayName}}\">\n    <div class=\"buildName\">\n      <a href=\"{{build.$viewLink}}\" title=\"View the build details inside Jenkins\">\n        {{build.displayName}}\n      </a>\n      <span class=\"buildParameters pull-right\">\n        <i class=\"fa fa-ellipsis-v\" title=\"build parameters: {{build.$parameterText}}\"></i>\n      </span>\n    </div>\n\n    <div class=\"buildDuration text-center\">\n      <a href=\"{{build.$logLink}}\" title=\"This build started at {{build.$timestamp}}\">\n        started {{build.$timestamp.relative()}}\n      </a>\n    </div>\n  </div>\n\n  <div ng-repeat=\"stage in build.stages | filter:model.filterText track by $index\" class=\"inline-block\">\n    <div class=\"pipeline-arrow inline-block\" ng-show=\"$index\">\n      <i class=\"fa fa-angle-double-right\"></i>\n    </div>\n    <div class=\"pipeline-deploy {{stage.$backgroundClass}} inline-block\">\n      <div class=\"text-center stageName\" title=\"{{stage.status}}\"><i class=\"{{stage.$iconClass}}\"></i>\n        <a href=\"{{stage.$viewLink}}\" title=\"This stage started at {{stage.$startTime}}\" target=\"jenkins\">\n          {{stage.stageName}}\n        </a>\n      </div>\n      <div class=\"text-center stageStartTime\" title=\"Stage started at {{stage.$startTime}}\">\n        <a href=\"{{stage.$logLink}}\" title=\"View the logs of this stage\">\n          {{stage.duration.duration()}}\n        </a>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/pipelines.html","<div class=\"row\" ng-controller=\"Developer.PipelinesController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-4\">\n      <span>\n        <hawtio-filter ng-show=\"model.job.builds.length\"\n                       ng-model=\"model.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter pipelines...\"></hawtio-filter>\n      </span>\n    </div>\n    <div class=\"col-md-4\">\n      <form class=\"form-inline\">\n        <div class=\"checkbox\" title=\"Only show build pipelines which are pending\">\n          <label>\n            <input type=\"checkbox\" ng-model=\"model.pendingOnly\"> &nbsp;Only pending builds\n          </label>\n        </div>\n      </form>\n\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.job.builds.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no pipelines for this job.</p>\n        </div>\n        <div ng-show=\"model.job.builds.length\">\n          <div class=\"pipeline-build-block\" ng-repeat=\"build in model.job.builds | filter:model.filterText track by $index\">\n            <div pipeline-view></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/projectDetail.html","<div ng-controller=\"Kubernetes.BuildConfigController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/buildConfigs\"><i class=\"fa fa-list\"></i></a>\n      <div class=\"pull-right\" ng-repeat=\"view in entity.$fabric8Views | orderBy:\'label\'\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n        <span class=\"pull-right\" ng-show=\"view.url\" >&nbsp;</span>\n      </div>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button class=\"btn btn-primary pull-right\"\n         title=\"Trigger this build\"\n         ng-disabled=\"!entity.$triggerUrl\"\n         ng-click=\"triggerBuild(entity)\"><i class=\"fa fa-play-circle-o\"></i> Trigger</button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div hawtio-object=\"entity\" config=\"config\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/projects.html","<div class=\"row\" ng-controller=\"Developer.ProjectsController\">\n  <script type=\"text/ng-template\" id=\"buildConfigLinkTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View details for this build configuration\"\n         href=\"{{baseUri}}/kubernetes/buildConfigs/{{row.entity.metadata.name}}\">\n<!--\n        <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n-->\n        {{row.entity.metadata.name}}</a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8Views track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigCodeViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8CodeViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigBuildViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8BuildViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigEnvironmentViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8EnvironmentViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigTeamViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8TeamViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"model.buildconfigs.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter projects...\"></hawtio-filter>\n      </span>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"fetched\"\n              title=\"Delete the selected build configuration\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n              <i class=\"fa fa-remove\"></i> Delete\n      </button>\n\n      <button ng-show=\"model.fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\"\n              title=\"Delete the selected project\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-primary pull-right\" href=\"/workspaces/{{namespace}}/forge/createProject\"\n         title=\"Create a new project in this workspace\">\n        <i class=\"fa fa-plus\"></i> Create Project</a>\n      </a>\n\n<!--\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <button class=\"btn btn-default pull-right\"\n         title=\"Trigger the given build\"\n         ng-disabled=\"tableConfig.selectedItems.length != 1 || !tableConfig.selectedItems[0].$triggerUrl\"\n         ng-click=\"triggerBuild(tableConfig.selectedItems[0])\"><i class=\"fa fa-play-circle-o\"></i> Trigger</button>\n-->\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.buildconfigs.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no projects in this workspace.</p>\n        </div>\n        <div ng-show=\"model.buildconfigs.length\">\n          <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/tools.html","<div ng-controller=\"Kubernetes.BuildConfigController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.tools.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter tools...\"></hawtio-filter>\n      </span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"entity.tools.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no tools currently available.</p>\n        </div>\n        <div ng-show=\"entity.tools.length\">\n          <div ng-hide=\"entity.tools.length\" class=\"align-center\">\n            <p class=\"alert alert-info\">There are no tools currently available.</p>\n          </div>\n          <div ng-repeat=\"env in entity.tools | filter:filterTemplates | orderBy:\'label\' track by $index\">\n            <div class=\"row\"\n                 title=\"{{env.description}}\">\n              <div class=\"col-md-9\">\n                <a href=\"{{env.url}}\">\n                  <h3>\n                    <i class=\"{{env.iconClass}}\"></i>\n                    {{env.label}}\n                  </h3>\n                </a>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/workspace.html","<div ng-controller=\"Developer.WorkspaceController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/workspaces\"><i class=\"fa fa-list\"></i></a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$configLink\"\n              title=\"View the workspace configuration\"\n              href=\"{{entity.$configLink}}\">\n        Configuration\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$podLink\"\n              title=\"View the workspace pod\"\n              href=\"{{entity.$podLink}}\">\n        Pod\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\" ng-show=\"entity.$logsLink\"\n              title=\"View the workspace logs\"\n              href=\"{{entity.$logsLink}}\">\n        View Log\n      </a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div hawtio-object=\"entity\" config=\"config\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/developer/html/workspaces.html","<div ng-controller=\"Developer.WorkspacesController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <script type=\"text/ng-template\" id=\"viewNamespaceProjectsTemplate.html\">\n    <div class=\"ngCellText\">\n      <div class=\"ngCellText\">\n        <a href=\"{{row.entity.$projectsLink}}\" title=\"View the projects for this namespace\">\n          {{row.entity.$name}}\n        </a>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"viewNamespaceTemplate.html\">\n    <div class=\"ngCellText\">\n      <div class=\"ngCellText\">\n        <a href=\"{{row.entity.$runtimeLink}}\" title=\"View the runtime resources in this namespace\">\n          {{row.entity.$name}}\n        </a>\n      </div>\n    </div>\n  </script>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.workspaces.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter namespaces...\"></hawtio-filter>\n      </span>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\"\n         title=\"Create a new workspace\"\n         href=\"{{baseUri}}/workspaces/create\"><i class=\"fa fa-plus\"></i> Create Namespace</a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.workspaces.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no namespaces currently available.</p>\n        </div>\n        <div ng-show=\"model.workspaces.length\">\n          <div ng-show=\"mode == \'list\'\">\n            <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n          </div>\n\n          <div ng-hide=\"mode == \'list\'\">\n            <div class=\"column-box\"\n                 ng-repeat=\"workspace in model.workspaces | filter:filterTemplates | orderBy:\'metadata.name\' track by $index\">\n              <div class=\"row\">\n                <div class=\"col-md-2\">\n                  <a href=\"{{workspace.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <img style=\"width: 64px; height: 64px;\" ng-src=\"{{workspace.$iconUrl}}\">\n                  </a>\n                </div>\n                <div class=\"col-md-9\">\n                  <a href=\"{{workspace.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <h3 ng-bind=\"workspace.metadata.name\"></h3>\n                  </a>\n                </div>\n<!--\n                <div class=\"col-md-1\">\n                  <a href=\"\" ng-click=\"deleteService(service)\"><i class=\"fa fa-remove red\"></i></a>\n                </div>\n-->\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/apps.html","<div ng-controller=\"Kubernetes.Apps\">\n  <script type=\"text/ng-template\" id=\"appIconTemplate.html\">\n    <div class=\"ngCellText\" title=\"{{row.entity.$info.description}}\">\n      <a ng-href=\"row.entity.$appUrl\">\n        <img ng-show=\"row.entity.$iconUrl\" class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n      </a>\n      <span class=\"app-name\">\n        <a ng-click=\"row.entity.$select()\">\n          {{row.entity.$info.name}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appServicesTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"service in row.entity.services\">\n          <a ng-href=\"{{service | kubernetesPageLink}}\"\n             title=\"View service details\">\n            <span>{{service.metadata.name ||service.name || service.id}}</span>\n          </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appDeployedTemplate.html\">\n    <div class=\"ngCellText\" title=\"deployed at: {{row.entity.$creationDate | date:\'yyyy-MMM-dd HH:mm:ss Z\'}}\">\n      {{row.entity.$creationDate.relative()}}\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appReplicationControllerTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"controller in row.entity.replicationControllers\">\n        <a ng-href=\"{{controller | kubernetesPageLink}}\"\n           title=\"View controller details\">\n          <span>{{controller.metadata.name || controller.id}}</span>\n        </a>\n        &nbsp;\n        <span class=\"pull-right\">\n          <a class=\"badge badge-info\" href=\"\" ng-click=\"$emit(\'do-resize\', controller)\"\n            title=\"Resize the number of replicas of this controller\">\n             {{controller.spec.replicas || 0}}</a>\n        </span>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appPodCountsAndLinkTemplate.html\">\n    <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n      <div ng-repeat=\"podCounters in row.entity.$podCounters track by $index\">\n        <a ng-show=\"podCounters.podsLink\" href=\"{{podCounters.podsLink}}\" title=\"{{podCounters.labelText}}\">\n          <span ng-show=\"podCounters.valid\" class=\"badge badge-success\">{{podCounters.valid}}</span>\n          <span ng-show=\"podCounters.waiting\" class=\"badge\">{{podCounters.waiting}}</span>\n          <span ng-show=\"podCounters.error\" class=\"badge badge-warning\">{{podCounters.error}}</span>\n        </a>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appDetailTemplate.html\">\n    <div class=\"service-view-rectangle\" ng-repeat=\"view in item.$serviceViews\">\n      <div class=\"service-view-header\">\n        <span class=\"service-view-icon\">\n          <a ng-href=\"{{view.service | kubernetesPageLink}}\" title=\"View the service detail page\">\n            <img ng-show=\"item.$iconUrl\" ng-src=\"{{item.$iconUrl}}\">\n          </a>\n        </span>\n        <span class=\"service-view-name\" title=\"{{view.name}}\">\n          <a ng-href=\"{{view.service | kubernetesPageLink}}\" title=\"View the service detail page\">\n            {{view.appName}}\n          </a>\n        </span>\n        <span class=\"service-view-address\" title=\"The service address\">\n          <a ng-show=\"view.service.$connectUrl\" target=\"_blank\" href=\"{{view.service.$connectUrl}}\" title=\"Connect to the service\">\n            {{view.service.$host}}\n          </a>\n          <span ng-hide=\"view.service.$connectUrl\">{{view.service.$host}}</span>\n        </span>\n        <span class=\"pull-right\">\n          <a class=\"service-view-header-delete\" href=\"\" ng-click=\"deleteSingleApp(item)\" title=\"Delete this app\"><i\n                  class=\"fa fa-remove red\"></i></a>\n        </span>\n      </div>\n\n      <div class=\"service-view-detail-rectangle\">\n        <div class=\"service-view-detail-header\">\n          <div class=\"col-md-4\">\n            <div class=\"service-view-detail-deployed\" ng-show=\"view.createdDate\"\n                 title=\"deployed at: {{view.createdDate | date:\'yyyy-MMM-dd HH:mm:ss Z\'}}\">\n              deployed:\n              <span class=\"value\">{{view.createdDate.relative()}}</span>\n            </div>\n            <div class=\"service-view-detail-deployed\" ng-hide=\"view.createdDate\">\n              not deployed\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"service-view-detail-pod-template\" ng-show=\"view.controllerId\">\n              pod template:\n              <span class=\"value\" title=\"Go to the replication controller detail page\"><a\n                      ng-href=\"{{view.replicationController | kubernetesPageLink}}\">{{view.controllerId}}</a></span>\n            </div>\n            <div class=\"service-view-detail-pod-template\" ng-hide=\"view.controllerId\">\n              no pod template\n            </div>\n          </div>\n          <div class=\"col-md-4 service-view-detail-pod-counts\">\n            <span class=\"pull-right\">\n              pods:\n              <a href=\"\" ng-show=\"view.replicationController\" class=\"badge badge-info\"\n                ng-click=\"resizeDialog.open(view.replicationController)\"\n                title=\"Resize the number of pods\">\n                {{view.podCount}}\n              </a>\n              <span ng-hide=\"view.replicationController\" class=\"badge badge-success\">\n                {{view.podCount}}\n              </span>\n            </span>\n          </div>\n        </div>\n\n        <div class=\"service-view-detail-pod-box\" ng-repeat=\"pod in item.pods track by $index\">\n          <div ng-show=\"podExpanded(pod)\" class=\"service-view-detail-pod-summary-expand\">\n            <table>\n              <tr>\n                <td class=\"service-view-detail-pod-status\">\n                  <i ng-class=\"pod.statusClass\"></i>\n                </td>\n                <td class=\"service-view-detail-pod-connect\" ng-show=\"pod.$jolokiaUrl\"\n                    ng-controller=\"Kubernetes.ConnectController\">\n                  <a class=\"clickable\"\n                     ng-click=\"doConnect(pod)\"\n                     title=\"Open a new window and connect to this container\">\n                    <i class=\"fa fa-sign-in\"></i>\n                  </a>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-id\" title=\"{{pod.id}}\">\n                    <span class=\"value\">Pod <a title=\"Go to the pod detail page\" ng-href=\"{{pod | kubernetesPageLink}}\">{{pod.idAbbrev}}</a></span>\n                  </div>\n                  <div class=\"service-view-detail-pod-ip\">\n                    IP:\n                    <span class=\"value\">{{pod.status.podIP}}</span>\n                  </div>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-ports\">\n                    ports: <span class=\"value\">{{pod.$containerPorts.join(\", \")}}</span>\n                  </div>\n                  <div class=\"service-view-detail-pod-minion\">\n                    minion:\n                    <span class=\"value\">\n                      <a ng-show=\"pod.$host\" ng-href=\"{{baseUri}}/kubernetes/hosts/{{pod.$host}}\">{{pod.$host}}</a>\n                    </span>\n                  </div>\n                </td>\n                <td class=\"service-view-detail-pod-expand\" ng-click=\"collapsePod(pod)\">\n                  <i class=\"fa fa-chevron-left\"></i>\n                </td>\n              </tr>\n            </table>\n            <!--\n                                      <div class=\"service-view-detail-pod-status\">\n                                        status:\n                                        <span class=\"value\">{{pod.status}}</span>\n                                      </div>\n            -->\n          </div>\n\n          <div ng-hide=\"podExpanded(pod)\" class=\"service-view-detail-pod-summary\">\n            <table>\n              <tr>\n                <td class=\"service-view-detail-pod-status\">\n                  <i ng-class=\"pod.statusClass\"></i>\n                </td>\n                <td class=\"service-view-detail-pod-connect\" ng-show=\"pod.$jolokiaUrl\"\n                    ng-controller=\"Kubernetes.ConnectController\">\n                  <a class=\"clickable\"\n                     ng-click=\"doConnect(pod)\"\n                     title=\"Open a new window and connect to this container\">\n                    <i class=\"fa fa-sign-in\"></i>\n                  </a>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-id\" title=\"{{pod.id}}\">\n                    <span class=\"value\">Pod <a title=\"Go to the pod detail page\" ng-href=\"{{pod | kubernetesPageLink}}\">{{pod.idAbbrev}}</a></span>\n                  </div>\n                  <div class=\"service-view-detail-pod-ip\">\n                    IP:\n                    <span class=\"value\">{{pod.status.podIP}}</span>\n                  </div>\n                </td>\n                <td class=\"service-view-detail-pod-expand\" ng-click=\"expandPod(pod)\">\n                  <i class=\"fa fa-chevron-right\"></i>\n                </td>\n              </tr>\n            </table>\n          </div>\n        </div>\n      </div>\n    </div>\n  </script>\n\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div ng-hide=\"appSelectorShow\">\n    <div class=\"row filter-header\">\n      <div class=\"col-md-12\">\n        <span ng-show=\"model.apps.length && !id\">\n          <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                         css-class=\"input-xxlarge\"\n                         placeholder=\"Filter apps...\"></hawtio-filter>\n        </span>\n        <span ng-hide=\"id\" class=\"pull-right\">\n          <div class=\"btn-group\">\n            <a class=\"btn\" ng-disabled=\"mode == \'list\'\" href=\"\" ng-click=\"mode = \'list\'\">\n              <i class=\"fa fa-list\"></i></a>\n            <a class=\"btn\" ng-disabled=\"mode == \'detail\'\" href=\"\" ng-click=\"mode = \'detail\'\">\n              <i class=\"fa fa-table\"></i></a>\n          </div>\n        </span>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button ng-show=\"model.apps.length && mode == \'list\'\"\n                class=\"btn btn-danger pull-right\"\n                ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n                ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n          <i class=\"fa fa-remove\"></i> Delete\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n<!--\n        <button ng-show=\"model.showRunButton\"\n                class=\"btn btn-success pull-right\"\n                ng-click=\"appSelectorShow = true\"\n                title=\"Run an application\">\n          <i class=\"fa fa-play-circle\"></i> Run ...\n        </button>\n-->\n        <span class=\"pull-right\">&nbsp;</span>\n        <span ng-include=\"\'runButton.html\'\"></span>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button ng-show=\"id\"\n                class=\"btn btn-primary pull-right\"\n                ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div ng-hide=\"model.fetched\">\n          <div class=\"align-center\">\n            <i class=\"fa fa-spinner fa-spin\"></i>\n          </div>\n        </div>\n        <div ng-show=\"model.fetched && !id\">\n          <div ng-hide=\"model.apps.length\" class=\"align-center\">\n            <p class=\"alert alert-info\">There are no apps currently available.</p>\n          </div>\n          <div ng-show=\"model.apps.length\">\n            <div ng-show=\"mode == \'list\'\">\n              <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n            </div>\n            <div ng-show=\"mode == \'detail\'\">\n              <div class=\"app-detail\" ng-repeat=\"item in model.apps | filter:tableConfig.filterOptions.filterText | orderBy:\'$name\' track by $index\">\n                <ng-include src=\"\'appDetailTemplate.html\'\"/>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div ng-show=\"model.fetched && id\">\n          <div class=\"app-detail\">\n            <ng-include src=\"\'appDetailTemplate.html\'\"/>\n          </div>\n        </div>\n      </div>\n    </div>\n\n  </div>\n  <div ng-show=\"appSelectorShow\">\n    <div class=\"col-md-7\">\n      <div class=\"row\">\n        <hawtio-filter ng-model=\"appSelector.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter apps...\"></hawtio-filter>\n      </div>\n      <div class=\"row\">\n        <ul>\n          <li class=\"no-list profile-selector-folder\" ng-repeat=\"folder in model.appFolders\"\n              ng-show=\"appSelector.showFolder(folder)\">\n            <div class=\"expandable\" ng-class=\"appSelector.isOpen(folder)\">\n              <div title=\"{{folder.path}}\" class=\"title\">\n                <i class=\"expandable-indicator folder\"></i> <span class=\"folder-title\" ng-show=\"folder.path\">{{folder.path.capitalize(true)}}</span><span\n                      class=\"folder-title\" ng-hide=\"folder.path\">Uncategorized</span>\n              </div>\n              <div class=\"expandable-body\">\n                <ul>\n                  <li class=\"no-list profile\" ng-repeat=\"profile in folder.apps\" ng-show=\"appSelector.showApp(profile)\">\n                    <div class=\"profile-selector-item\">\n                      <div class=\"inline-block profile-selector-checkbox\">\n                        <input type=\"checkbox\" ng-model=\"profile.selected\"\n                               ng-change=\"appSelector.updateSelected()\">\n                      </div>\n                      <div class=\"inline-block profile-selector-name\" ng-class=\"appSelector.getSelectedClass(profile)\">\n                        <span class=\"contained c-max\">\n                          <a href=\"\" ng-click=\"appSelector.select(profile, !profile.selected)\"\n                             title=\"Details for {{profile.id}}\">\n                            <img ng-show=\"profile.$iconUrl\" class=\"icon-small-app\" ng-src=\"{{profile.$iconUrl}}\">\n                            <span class=\"app-name\">{{profile.name}}</span>\n                          </a>\n                        </span>\n                      </div>\n                    </div>\n\n                  </li>\n                </ul>\n              </div>\n            </div>\n          </li>\n        </ul>\n      </div>\n    </div>\n    <div class=\"col-md-5\">\n      <div class=\"row\">\n        <button class=\"btn btn-primary pull-right\"\n                ng-click=\"appSelectorShow = undefined\"><i class=\"fa fa-circle-arrow-left\"></i> Back\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button class=\"btn pull-right\"\n                ng-disabled=\"!appSelector.selectedApps.length\"\n                title=\"Clears the selected Apps\"\n                ng-click=\"appSelector.clearSelected()\"><i class=\"fa fa-check-empty\"></i> Clear\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button class=\"btn btn-success pull-right\"\n                ng-disabled=\"!appSelector.selectedApps.length\"\n                ng-click=\"appSelector.runSelectedApps()\"\n                title=\"Run the selected apps\">\n          <i class=\"fa fa-play-circle\"></i>\n          <ng-pluralize count=\"appSelector.selectedApps.length\"\n                        when=\"{\'0\': \'No App Selected\',\n                                       \'1\': \'Run App\',\n                                       \'other\': \'Run {} Apps\'}\"></ng-pluralize>\n\n        </button>\n      </div>\n      <div class=\"row\">\n        <!--\n                <div ng-hide=\"appSelector.selectedApps.length\">\n                  <p class=\"alert pull-right\">\n                    Please select an App\n                  </p>\n                </div>\n        -->\n\n        <div ng-show=\"appSelector.selectedApps.length\">\n\n          <ul class=\"zebra-list pull-right\">\n            <li ng-repeat=\"app in appSelector.selectedApps\">\n              <img ng-show=\"app.$iconUrl\" class=\"icon-selected-app\" ng-src=\"{{app.$iconUrl}}\">\n              <strong class=\"green selected-app-name\">{{app.name}}</strong>\n              &nbsp;\n              <i class=\"red clickable fa fa-remove\"\n                 title=\"Remove appp\"\n                 ng-click=\"appSelector.select(app, false)\"></i>\n            </li>\n          </ul>\n        </div>\n      </div>\n    </div>\n  </div>\n  <ng-include src=\"\'resizeDialog.html\'\"/>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/breadcrumbs.html","<div ng-show=\"breadcrumbConfig\" ng-init=\"breadcrumbConfig = $parent.breadcrumbConfig\"\n     ng-controller=\"Developer.NavBarController\">\n  <ol class=\"breadcrumb\">\n    <li ng-repeat=\"breadcrumb in breadcrumbConfig\" ng-show=\"isValid(breadcrumb)\"\n        class=\"{{breadcrumb.active ? \'active\' : \'\'}}\"\n        title=\"{{breadcrumb.title}}\">\n      <a ng-show=\"breadcrumb.href && !breadcrumb.active\" href=\"{{breadcrumb.href}}\">{{breadcrumb.label}}</a>\n      <span ng-hide=\"breadcrumb.href && !breadcrumb.active\">{{breadcrumb.label}}</span>\n  </ol>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/build.html","<div ng-controller=\"Kubernetes.BuildController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/builds\"><i class=\"fa fa-list\"></i></a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$configLink\"\n              title=\"View the build configuration\"\n              href=\"{{entity.$configLink}}\">\n        Configuration\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$podLink\"\n              title=\"View the build pod\"\n              href=\"{{entity.$podLink}}\">\n        Pod\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\" ng-show=\"entity.$logsLink\"\n              title=\"View the build logs\"\n              href=\"{{entity.$logsLink}}\">\n        View Log\n      </a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-object=\"entity\" config=\"config\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/buildConfig.html","<div ng-controller=\"Kubernetes.BuildConfigController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$editLink\" href=\"{{entity.$editLink}}\">\n        <i class=\"fa fa-pencil-square-o\"></i> Edit\n      </a>\n      <div class=\"pull-right\" ng-repeat=\"view in entity.$fabric8Views | orderBy:\'label\'\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n        <span class=\"pull-right\" ng-show=\"view.url\" >&nbsp;</span>\n      </div>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button class=\"btn btn-primary pull-right\"\n         title=\"Trigger this build\"\n         ng-disabled=\"!entity.$triggerUrl\"\n         ng-click=\"triggerBuild(entity)\"><i class=\"fa fa-play-circle-o\"></i> Trigger</button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-object=\"entity\" config=\"config\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/buildConfigCreate.html","<div ng-controller=\"Kubernetes.BuildConfigController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/buildConfigs\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Saves changes to this build configuration\"\n              ng-click=\"save()\">\n        Create Build Configuration\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/buildConfigEdit.html","<div ng-controller=\"Kubernetes.BuildConfigEditController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Saves changes to this project configuration\"\n              ng-disabled=\"!entity.metadata.name\"\n              ng-click=\"save()\">\n        Save Changes\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n\n        <form name=\"nameForm\" ng-disabled=\"config.mode == 0\" class=\"form-horizontal\">\n          <fieldset>\n            <legend ng-show=\"config.label || config.description\" ng-hide=\"config.hideLegend\"\n                    class=\"ng-binding\"></legend>\n            <div class=\"row\">\n              <div class=\"clearfix col-md-12\">\n                <div class=\"form-group\">\n                  <label class=\"control-label\">Name</label>\n                  <input type=\"text\" class=\"form-control\" placeholder=\"project name\" pattern=\"[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\" ng-model=\"entity.metadata.name\" required>\n\n                  <p class=\"form-warning bg-danger\" ng-show=\"nameForm.$error.pattern\">\n                    Project name must be a lower case DNS name with letters, numbers and dots or dashes such as `example.com`\n                  </p>\n                </div>\n              </div>\n            </div>\n          </fieldset>\n        </form>\n\n\n        <!--\n                <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n        -->\n        <div hawtio-form-2=\"specConfig\" entity=\"spec\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/buildConfigs.html","<div class=\"row\" ng-controller=\"Kubernetes.BuildConfigsController\">\n  <script type=\"text/ng-template\" id=\"buildConfigLinkTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View details for this build configuration\"\n         href=\"{{baseUri}}/kubernetes/buildConfigs/{{row.entity.metadata.name}}\">\n<!--\n        <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n-->\n        {{row.entity.metadata.name}}</a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8Views track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigCodeViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8CodeViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigBuildViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8BuildViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigEnvironmentViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8EnvironmentViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildConfigTeamViewsTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"view in row.entity.$fabric8TeamViews track by $index\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"buildConfigs.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter build configurations...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched\"\n              title=\"Delete the selected build configuration\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Add a build configuration for an existing project\"\n         href=\"{{baseUri}}/kubernetes/buildConfigCreate\"><i class=\"fa fa-wrench\"></i> Add Build</a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-primary pull-right\" href=\"/workspaces/{{namespace}}/forge/createProject\"\n         ng-show=\"isLoggedIntoGogs()\"\n         title=\"Create a new project and repository\">\n        <i class=\"fa fa-plus\"></i> Create Project</a>\n      </a>\n      <span class=\"pull-right\" ng-show=\"isLoggedIntoGogs()\">&nbsp;</span>\n\n      <a class=\"btn btn-primary pull-right\" href=\"/workspaces/{{namespace}}/forge/repos\"\n         ng-hide=\"isLoggedIntoGogs()\"\n         title=\"Sign in to gogs so that you can create a new project\">\n        <i class=\"fa fa-sign-in\"></i> Sign In</a>\n      </a>\n      <span class=\"pull-right\" ng-hide=\"isLoggedIntoGogs()\">&nbsp;</span>\n\n      <button class=\"btn btn-default pull-right\"\n         title=\"Trigger the given build\"\n         ng-disabled=\"tableConfig.selectedItems.length != 1 || !tableConfig.selectedItems[0].$triggerUrl\"\n         ng-click=\"triggerBuild(tableConfig.selectedItems[0])\"><i class=\"fa fa-play-circle-o\"></i> Trigger</button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.buildconfigs.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no build configurations available.</p>\n          <a class=\"btn btn-primary\" href=\"{{baseUri}}/kubernetes/buildConfigCreate\"><i class=\"fa fa-wrench\"></i> Add Build Configuration</a>\n        </div>\n        <div ng-show=\"model.buildconfigs.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/buildLogs.html","<div ng-controller=\"Kubernetes.BuildLogsController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\" ng-show=\"entity.$viewLink\"\n         title=\"View the build detail\"\n         href=\"{{entity.$viewLink}}\">\n        Build\n      </a>\n      <a class=\"btn btn-primary pull-right\" ng-show=\"entity.$configLink\"\n         title=\"View the build configuration\"\n         href=\"{{entity.$configLink}}\">\n        Configuration\n      </a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <h3>logs for {{entity.$configId}}</h3>\n\n        <p>\n          <pre>\n            <code>\n              {{logsText}}\n            </code>\n          </pre>\n        </p>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/builds.html","<div class=\"row\" ng-controller=\"Kubernetes.BuildsController\">\n  <script type=\"text/ng-template\" id=\"buildLinkTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View details for this build: {{row.entity.$name}}\"\n         href=\"{{row.entity.$viewLink}}\">\n        <!--\n                <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n        -->\n        {{row.entity.$shortName}}\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildPodTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View the pod for this build: {{row.entity.podName}}\" ng-show=\"row.entity.$podLink\"\n         href=\"{{row.entity.$podLink}}\">\n        {{row.entity.$podShortName}}</a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildLogsTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View the log for this build\" ng-show=\"row.entity.$logsLink\"\n         href=\"{{row.entity.$logsLink}}\">\n        <i class=\"fa fa-file-text-o\"></i>  Logs\n      </a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildRepositoryTemplate.html\">\n    <div class=\"ngCellText\">\n      <a ng-show=\"row.entity.parameters.source.git.uri\" target=\"gitRepository\"\n         title=\"View the git based source repository\"\n         href=\"{{row.entity.parameters.source.git.uri}}\">\n        {{row.entity.parameters.source.git.uri}}\n      </a>\n      <span ng-hide=\"row.entity.parameters.source.git.uri\">\n        {{row.entity.parameters.source.git.uri}}\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildStatusTemplate.html\">\n    <div class=\"ngCellText\" ng-switch=\"row.entity.status.phase\">\n      <span ng-switch-when=\"New\" class=\"text-primary\">\n        <i class=\"fa fa-spin fa-spinner\"></i> New\n      </span>\n      <span ng-switch-when=\"Pending\" class=\"text-primary\">\n        <i class=\"fa fa-spin fa-spinner\"></i> Pending\n      </span>\n      <span ng-switch-when=\"Running\" class=\"text-primary\">\n        <i class=\"fa fa-spin fa-spinner\"></i> Running\n      </span>\n      <span ng-switch-when=\"Complete\" class=\"text-success\">\n        <i class=\"fa fa-check-circle\"></i> Complete\n      </span>\n      <span ng-switch-when=\"Failed\" class=\"text-danger\">\n        <i class=\"fa fa-exclamation-circle\"></i> Failed\n      </span>\n      <span ng-switch-default class=\"text-warning\">\n        <i class=\"fa fa-exclamation-triangle\"></i> {{row.entity.status}}\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"buildTimeTemplate.html\">\n    <div class=\"ngCellText\" title=\"built at: {{row.entity.$creationDate | date : \'h:mm:ss a, EEE MMM yyyy\'}}\">\n      {{row.entity.$creationDate.relative()}}\n    </div>\n  </script>\n\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" >\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-show=\"builds.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter builds...\"></hawtio-filter>\n      </span>\n      <div class=\"pull-right\" ng-repeat=\"view in buildConfig.$fabric8BuildViews | orderBy:\'label\'\">\n        <a title=\"{{view.description}}\" ng-show=\"view.url\" ng-href=\"{{view.url}}\" class=\"btn btn-default\">\n          <i class=\"{{view.iconClass}}\" ng-show=\"view.iconClass\"></i>\n          {{view.label}}\n        </a>\n        <span class=\"pull-right\" ng-show=\"view.url\" >&nbsp;</span>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div ng-hide=\"builds.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no builds currently running.</p>\n        </div>\n        <div ng-show=\"builds.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/deploymentConfig.html","<div ng-controller=\"Kubernetes.DeploymentConfigController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/deploymentConfigs\"><i class=\"fa fa-list\"></i></a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-object=\"entity\" config=\"config\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/deploymentConfigs.html","<div class=\"row\" ng-controller=\"Kubernetes.DeploymentConfigsController\">\n  <script type=\"text/ng-template\" id=\"deploymentConfigLinkTemplate.html\">\n    <div class=\"ngCellText\">\n      <a title=\"View details for this build configuration\"\n         href=\"{{baseUri}}/kubernetes/deploymentConfigs/{{row.entity.metadata.name}}\">\n<!--\n        <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n-->\n        {{row.entity.metadata.name}}</a>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"deploymentConfigLabelTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"(key, label) in row.entity.template.controllerTemplate.template.metadata.labels track by $index\"\n            class=\"pod-label badge\"\n            ng-class=\"labelClass(key)\"\n            ng-click=\"clickTag(entity, key, label)\"\n            title=\"{{key}}\">{{label}}</span>\n    </div>\n  </script>\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"deploymentConfigs.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter deployment configurations...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched && deploymentConfigs.length\"\n              title=\"Delete the selected build configuration\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new build configuration\"\n         href=\"{{baseUri}}/kubernetes/buildConfigCreate\"><i class=\"fa fa-plus\"></i> Create</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button class=\"btn btn-primary pull-right\"\n         ng-show=\"fetched && deploymentConfigs.length\"\n         title=\"Trigger the given build\"\n         ng-disabled=\"tableConfig.selectedItems.length != 1 || !tableConfig.selectedItems[0].$triggerUrl\"\n         ng-click=\"triggerBuild(tableConfig.selectedItems[0])\"><i class=\"fa fa-play-circle-o\"></i> Trigger</button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div ng-hide=\"deploymentConfigs.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no deployment configurations available.</p>\n          <a class=\"btn btn-primary\" href=\"{{baseUri}}/kubernetes/deploymentConfigCreate\"><i class=\"fa fa-plus\"></i> Create Deployment Configuration</a>\n        </div>\n        <div ng-show=\"deploymentConfigs.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/events.html","<div ng-controller=\"Kubernetes.EventsController\">\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.events.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter events...\"></hawtio-filter>\n      </span>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      <span ng-include=\"\'runButton.html\'\"></span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.events.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no events currently available.</p>\n        </div>\n        <div ng-show=\"model.events.length\">\n          <div ng-show=\"mode == \'list\'\">\n            <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                   hawtio-simple-table=\"tableConfig\"></table>\n          </div>\n\n          <div ng-hide=\"mode == \'list\'\">\n            <div class=\"column-box\"\n                 ng-repeat=\"service in model.serviceApps | filter:filterTemplates | orderBy:\'metadata.name\' track by $index\">\n              <div class=\"row\">\n                <div class=\"col-md-2\">\n                  <a href=\"{{service.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <img style=\"width: 64px; height: 64px;\" ng-src=\"{{service.$iconUrl}}\">\n                  </a>\n                </div>\n                <div class=\"col-md-9\">\n                  <a href=\"{{service.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <h3 ng-bind=\"service.metadata.name\"></h3>\n                  </a>\n                </div>\n<!--\n                <div class=\"col-md-1\">\n                  <a href=\"\" ng-click=\"deleteService(service)\"><i class=\"fa fa-remove red\"></i></a>\n                </div>\n-->\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/host.html","<div ng-controller=\"Kubernetes.HostController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/hosts\"><i class=\"fa fa-list\"></i></a>\n      <a class=\"btn pull-right\"\n         ng-click=\"flipRaw()\"\n         title=\"{{rawMode ? \'Raw mode\' : \'Form mode\'}}\">{{rawMode ? \'From\' : \'Raw\'}}</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\"\n              title=\"View all the pods on this host\"\n              href=\"{{baseUri}}/kubernetes/pods/?q=host={{item.id}}\">\n        Pods\n      </a>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched && !rawMode\">\n        <div hawtio-object=\"item\" config=\"itemConfig\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"span12\">\n    <div ng-hide=\"model.fetched\">\n      <div class=\"align-center\">\n        <i class=\"fa fa-spinner fa-spin\"></i>\n      </div>\n    </div>\n    <div ng-show=\"model.fetched && rawMode\">\n      <div class=\"row-fluid wiki-fixed form-horizontal\">\n        <div class=\"control-group editor-autoresize\">\n          <textarea id=\"source\" ui-codemirror=\"codeMirrorOptions\" readonly=\"true\" ng-model=\"rawModel\" style=\"width: 90%; height: 700px\"></textarea>\n        </div>\n      </div>\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/hosts.html","<div class=\"row\" ng-controller=\"Kubernetes.HostsController\">\n  <script type=\"text/ng-template\" id=\"hostLinkTemplate.html\">\n    <div class=\"ngCellText\">\n      </div>\n  </script>\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-show=\"model.hosts.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter hosts...\"></hawtio-filter>\n      </span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.hosts.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no hosts currently running.</p>\n        </div>\n        <div ng-show=\"model.hosts.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/imageRepositories.html","<div class=\"row\" ng-controller=\"Kubernetes.ImageRepositoriesController\">\n  <script type=\"text/ng-template\" id=\"imageRegistryLabelTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"(key, label) in row.entity.tags track by $index\"\n            class=\"pod-label badge\"\n            ng-class=\"labelClass(key)\"\n            ng-click=\"clickTag(entity, key, label)\"\n            title=\"{{key}}\">{{label}}</span>\n    </div>\n  </script>\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"imageRepositories.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter image repositories...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched && imageRepositories.length\"\n              title=\"Delete the selected build configuration\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new image repository\"\n         href=\"{{baseUri}}/kubernetes/imageRepositoryCreate\"><i class=\"fa fa-plus\"></i> Create</a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div ng-hide=\"imageRepositories.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no image repositories available.</p>\n          <a class=\"btn btn-primary\" href=\"{{baseUri}}/kubernetes/imageRepositoryCreate\"><i class=\"fa fa-plus\"></i> Create Image Repository</a>\n        </div>\n        <div ng-show=\"imageRepositories.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/kubernetesJsonDirective.html","<div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div class=\"fabric-page-header row\">\n\n        <div class=\"pull-left\" ng-show=\"iconURL\">\n          <div class=\"app-logo\">\n            <img ng-src=\"{{iconURL}}\">&nbsp;\n          </div>\n        </div>\n        <div class=\"pull-left\">\n            <h2 class=\"list-inline\"><span class=\"contained c-wide3\">&nbsp;{{displayName || appTitle}}</span></h2>\n        </div>\n        <div class=\"pull-right\">\n          <button class=\"btn btn-success pull-right\"\n                  title=\"Run this application\"\n                  ng-disabled=\"!config || config.error\"\n                  ng-click=\"apply()\">\n            <i class=\"fa fa-play-circle\"></i> Run\n          </button>\n        </div>\n        <div class=\"pull-left col-md-10 profile-summary-wide\">\n          <div\n               ng-show=\"summaryHtml\"\n               ng-bind-html-unsafe=\"summaryHtml\"></div>\n        </div>\n      </div>\n\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/layoutKubernetes.html","<script type=\"text/ng-template\" id=\"runButton.html\">\n  <button ng-show=\"model.showRunButton\"\n          class=\"btn btn-success pull-right\"\n          ng-click=\"viewTemplates()\"\n          title=\"Run an application from a template\">\n    <i class=\"fa fa-play-circle\"></i> Run ...\n  </button>\n</script>\n<script type=\"text/ng-template\" id=\"idTemplate.html\">\n  <div class=\"ngCellText nowrap\">\n    <a href=\"\"\n       title=\"View details for {{row.entity.metadata.name || row.entity.name}}\"\n       ng-href=\"{{row.entity | kubernetesPageLink}}\">\n      <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\" ng-show=\"row.entity.$iconUrl\">\n      {{row.entity.metadata.name || row.entity.name}}</a>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"selectorTemplate.html\">\n  <div class=\"ngCellText\">\n    <span ng-repeat=\"(name, value) in row.entity.spec.selector track by $index\">\n      <strong>{{name}}</strong>: {{value}}\n    </span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"podCountsAndLinkTemplate.html\">\n  <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n    <a ng-show=\"row.entity.$podCounters.podsLink\" href=\"{{row.entity.$podCounters.podsLink}}\" title=\"View pods\">\n      <span ng-show=\"row.entity.$podCounters.ready\" class=\"badge badge-success\">{{row.entity.$podCounters.ready}}</span>\n      <span ng-show=\"row.entity.$podCounters.valid\" class=\"badge badge-info\">{{row.entity.$podCounters.valid}}</span>\n      <span ng-show=\"row.entity.$podCounters.waiting\" class=\"badge\">{{row.entity.$podCounters.waiting}}</span>\n      <span ng-show=\"row.entity.$podCounters.error\" class=\"badge badge-warning\">{{row.entity.$podCounters.error}}</span>\n    </a>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"labelTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"entity=row.entity\" ng-controller=\"Kubernetes.Labels\">\n    <p ng-show=\"data\"><strong>Labels</strong></p>\n    <span ng-repeat=\"label in labels track by $index\"\n          class=\"pod-label badge\"\n          ng-class=\"labelClass(label.key)\"\n          ng-click=\"handleClick(entity, label.key, label)\"\n          title=\"{{label.key}}\">{{label.title}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"eventSourceTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"labels=row.entity.source\">\n    <p ng-show=\"data\"><strong>Labels</strong></p>\n    <span ng-repeat=\"(key, value) in labels track by $index\"\n          class=\"pod-label badge\"\n          class=\"background-light-grey mouse-pointer\"\n          title=\"{{key}}\"\n          ng-click=\"$emit(\'labelFilterUpdate\', key + \'=\' + value)\">{{value}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"hostTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"host=row.entity.$host\">\n    <span class=\"pod-label badge\"\n          class=\"background-light-grey mouse-pointer\"\n          ng-click=\"$emit(\'labelFilterUpdate\', \'host=\' + host)\">{{host}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"portalAddress.html\">\n  <div class=\"ngCellText\">\n    <div ng-repeat=\"port in row.entity.$ports track by $index\">\n      <a target=\"_blank\" href=\"{{row.entity.$connectUrl}}\"\n         ng-show=\"row.entity.$connectUrl && row.entity.$podCounters.ready\"\n         title=\"Protocol {{row.entity.spec.protocol}}\">\n        {{row.entity.$host}}\n      </a>\n      <span ng-hide=\"row.entity.$connectUrl && row.entity.$podCounters.ready\">{{row.entity.spec.portalIP || row.entity.spec.clusterIP}}:{{port}}</span>\n    </div>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"iconCellTemplate.html\">\n  <div class=\"ngCellText\">\n    <img class=\"app-icon-small\" ng-src=\"{{row.entity.$iconUrl}}\">\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"ageTemplate.html\">\n  <div class=\"ngCellText\">\n    {{row.entity.$age}}\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"firstTimestampTemplate.html\">\n  <div class=\"ngCellText\" title=\"{{row.entity.$firstTimestamp}}\">\n    {{row.entity.$firstTimestamp.relative()}}\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"lastTimestampTemplate.html\">\n  <div class=\"ngCellText\" title=\"{{row.entity.$lastTimestamp}}\">\n    {{row.entity.$lastTimestamp.relative()}}\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"eventKindTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"kind=row.entity.involvedObject.kind\">\n    <span class=\"pod-label badge\"\n          class=\"background-light-grey mouse-pointer\"\n          ng-click=\"$emit(\'labelFilterUpdate\', \'kind=\' + kind)\">{{kind}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"eventNameTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"name=row.entity.involvedObject.name\">\n    <span class=\"pod-label badge\"\n          class=\"background-light-grey mouse-pointer\"\n          ng-click=\"$emit(\'labelFilterUpdate\', \'name=\' + name)\">{{name}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"eventSummaryTemplate.html\">\n  <div class=\"ngCellText\" title=\"Number of events on this resource\">\n    <a ng-show=\"row.entity.$eventsLink\" href=\"{{row.entity.$eventsLink}}\">\n      <span class=\"badge\">{{row.entity.$events.length}}</span>\n    </a>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"connectTemplate.html\">\n    <span ng-show=\"entity.$jolokiaUrl && entity.$ready\" ng-controller=\"Kubernetes.ConnectController\">\n      <a class=\"clickable\"\n         ng-click=\"doConnect(row.entity)\"\n         title=\"Open a new window and connect to this container\">\n        <i class=\"fa fa-sign-in\"></i>\n      </a>\n    </span>\n</script>\n<script type=\"text/ng-template\" id=\"termTemplate.html\">\n    <span ng-show=\"entity.status.phase === \'Running\'\" ng-controller=\"Kubernetes.TermController\">\n      <span ng-repeat=\"container in entity.spec.containers\" ng-show=\"canConnectTo(container)\">\n        <i class=\"fa fa-television clickable\" title=\"Open up a terminal to {{container.name}}\" ng-click=\"openTerminal(entity.metadata.selfLink, container.name)\"></i>\n      </span>\n    </span>\n</script>\n<script type=\"text/ng-template\" id=\"statusTemplate.html\">\n  <div class=\"ngCellText nowrap\" ng-init=\"entity=row.entity\" ng-controller=\"Kubernetes.PodStatus\"\n       title=\"Pod {{entity.metadata.name}} is {{entity.status.phase}}\">\n    <!-- in detail view -->\n    <p ng-show=\"data\"><strong>Status: </strong></p>\n    <i class=\"fa {{entity.$statusCss}}\"></i>\n    <span ng-show=\"data\">{{data}}</span>\n    <!-- in table -->\n    <span ng-include=\"\'connectTemplate.html\'\"></span>\n    <span ng-include=\"\'termTemplate.html\'\"></span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"resizeDialog.html\">\n  <div modal=\"resizeDialog.dialog.show\">\n    <form class=\"form-horizontal\" ng-submit=\"resizeDialog.onOk()\">\n      <div class=\"modal-header\"><h4>Scale {{resizeDialog.controller.metadata.name}}</h4></div>\n      <div class=\"modal-body\">\n        <div class=\"control-group\">\n          <label class=\"control-label\" for=\"replicas\">Number of pods you would like to scale to?</label>\n\n          <div class=\"controls\">\n            <input type=\"number\" min=\"0\" id=\"replicas\" ng-model=\"resizeDialog.newReplicas\">\n          </div>\n        </div>\n\n      </div>\n      <div class=\"modal-footer\">\n        <input class=\"btn btn-primary\" type=\"submit\"\n               ng-disabled=\"resizeDialog.newReplicas === resizeDialog.controller.status.replicas\"\n               value=\"Resize\">\n        <button class=\"btn btn-warning cancel\" type=\"button\" ng-click=\"resizeDialog.close()\">Cancel</button>\n      </div>\n    </form>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"namespaceSelector.html\">\n  <span ng-controller=\"Kubernetes.NamespaceController\">\n    namespace:\n    <select ng-model=\"namespace\" ng-options=\"namespace for namespace in namespaces\"\n            title=\"choose the namespace - which is a selection of resources in kubernetes\">\n    </select>\n  </span>\n</script>\n<script type=\"text/ng-template\" id=\"pendingPipelines.html\">\n  <div class=\"row\" ng-controller=\"Developer.PipelinesController\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div ng-hide=\"model.fetched\">\n          <div class=\"align-center\">\n            <i class=\"fa fa-spinner fa-spin\"></i>\n          </div>\n        </div>\n        <div ng-show=\"model.fetched\">\n          <div ng-hide=\"model.job.builds.length\" class=\"align-center\">\n            <p class=\"alert alert-info\">There are no pipelines for this job.</p>\n          </div>\n          <div ng-show=\"model.job.builds.length\">\n            <div class=\"pipeline-build-block\" ng-repeat=\"build in model.job.builds | filter:model.filterText track by $index\">\n              <div pipeline-view></div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"creationTimeTemplate.html\">\n  <div class=\"ngCellText\" title=\"created at: {{row.entity.$creationDate | date : \'h:mm:ss a, EEE MMM yyyy\'}}\">\n    {{row.entity.$creationDate.relative()}}\n  </div>\n</script>\n\n<div ng-controller=\"Kubernetes.TopLevel\">\n  <div class=\"wiki-icon-view\" ng-controller=\"Kubernetes.FileDropController\" nv-file-drop nv-file-over\n       uploader=\"uploader\" over-class=\"ready-drop\">\n    <div class=\"row kubernetes-view\" ng-view></div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/overview.html","<div ng-controller=\"Kubernetes.OverviewController\">\n  <script type=\"text/ng-template\" id=\"serviceBoxTemplate.html\">\n    <div>\n      <div class=\"align-left node-body\">{{entity.$portsText}}</div>\n      <div class=\"align-right node-header\" title=\"{{entity.metadata.name}}\" ng-bind=\"entity.metadata.name\"></div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"serviceTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div id=\"{{service._key}}\"\n             namespace=\"{{service.metadata.namespace}}\"\n             connect-to=\"{{service.connectTo}}\"\n             data-type=\"service\"\n             class=\"jsplumb-node kubernetes-node kubernetes-service-node\"\n             ng-controller=\"Kubernetes.OverviewBoxController\"\n             ng-init=\"entity=getEntity(\'service\', \'{{service._key}}\')\"\n             ng-mouseenter=\"mouseEnter($event)\"\n             ng-mouseleave=\"mouseLeave($event)\"\n             ng-click=\"viewDetails(entity, \'services\')\">\n          <div ng-init=\"entity=entity\" ng-include=\"\'serviceBoxTemplate.html\'\"></div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"overviewHostTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div id=\"{{host.elementId}}\"\n             data-type=\"host\"\n             class=\"kubernetes-host-container host\">\n             <h5><img ng-src=\"{{host.$iconUrl}}\" style=\"width: 32px; height: 32px;\">\n               <a ng-href=\"{{baseUri}}/kubernetes/hosts/{{host.id}}\">{{host.id}}</a>\n             </h5>\n          <div class=\"pod-container\"></div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"podTemplate.html\">\n    <div id=\"{{pod._key}}\"\n         data-type=\"pod\"\n         title=\"Pod ID: {{pod.metadata.name}}\"\n         class=\"jsplumb-node kubernetes-node kubernetes-pod-node\"\n         ng-mouseenter=\"mouseEnter($event)\"\n         ng-mouseleave=\"mouseLeave($event)\"\n         ng-controller=\"Kubernetes.OverviewBoxController\"\n         ng-init=\"entity=getEntity(\'pod\', \'{{pod._key}}\')\"\n         ng-click=\"viewDetails(entity, \'pods\')\">\n      <div class=\"css-table\">\n        <div class=\"css-table-row\">\n          <div class=\"pod-status-cell css-table-cell\">\n            <span ng-init=\"row={ entity: entity }\" ng-include=\"\'statusTemplate.html\'\"></span>\n          </div>\n          <div class=\"pod-label-cell css-table-cell\">\n            <span ng-init=\"row={ entity: entity }\" ng-include=\"\'labelTemplate.html\'\"></span>\n          </div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"replicationControllerTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div\n            id=\"{{replicationController._key}}\"\n            title=\"{{replicationController.id}}\"\n            data-type=\"replicationController\"\n            data-placement=\"top\"\n            connect-to=\"{{replicationController.connectTo}}\"\n            ng-mouseenter=\"mouseEnter($event)\"\n            ng-mouseleave=\"mouseLeave($event)\"\n            class=\"jsplumb-node kubernetes-replicationController-node kubernetes-node\"\n            ng-controller=\"Kubernetes.OverviewBoxController\"\n            ng-init=\"entity=getEntity(\'replicationController\', \'{{replicationController._key}}\')\"\n            ng-click=\"viewDetails(entity, \'replicationControllers\')\">\n            <img class=\"app-icon-medium\" ng-src=\"{{replicationController.$iconUrl}}\">\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"overviewTemplate.html\">\n    <div class=\"kubernetes-overview\"\n         hawtio-jsplumb\n         draggable=\"false\"\n         layout=\"false\"\n         node-sep=\"50\"\n         rank-sep=\"300\">\n      <div class=\"kubernetes-overview-row\">\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview services\">\n            <h6>Services</h6>\n          </div>\n        </div>\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview hosts\">\n            <h6>Hosts and Pods</h6>\n          </div>\n        </div>\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview replicationControllers\">\n            <h6>Replication controllers</h6>\n          </div>\n        </div>\n      </div>\n   </div>\n  </script>\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <kubernetes-overview ui-if=\"kubernetes.selectedNamespace\"><{{baseUri}}/kubernetes-overview>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/pipelines.html","<div class=\"row\" ng-controller=\"Kubernetes.PipelinesController\">\n  <script type=\"text/ng-template\" id=\"hostLinkTemplate.html\">\n    <div class=\"ngCellText\">\n    </div>\n  </script>\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span>\n        <hawtio-filter ng-show=\"pipelines.length\"\n                       ng-model=\"filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter builds...\"></hawtio-filter>\n      </span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new project\"\n         ng-show=\"forgeEnabled\"\n         href=\"/workspaces/{{namespace}}/forge/createProject\"><i class=\"fa fa-plus\"></i> Create Project</a>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div ng-hide=\"pipelines.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no build pipelines available.</p>\n          <a class=\"btn btn-primary\" href=\"{{baseUri}}/kubernetes/buildConfig\">Create Build Configuration</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div ng-show=\"fetched && pipelines.length\">\n    <div ng-repeat=\"pipeline in pipelines | filter:filterText\">\n      <div class=\"row\">\n\n        <div class=\"pipeline-row\">\n          <div ng-repeat=\"step in pipeline.triggersSteps\">\n            <div ng-switch=\"step.buildConfig.kind\">\n              <div ng-switch-default=\"\">\n                <div class=\"col-md-1\" ng-hide=\"$first\">\n                  <div class=\"pipeline-arrow\">\n                    <i class=\"fa fa-long-arrow-right\"></i>\n                  </div>\n                </div>\n\n                <div class=\"col-md-2 pipeline-build\" title=\"Build configuration\">\n                  <span class=\"pipeline-build-details\">\n                    <a title=\"View details for this build configuration\"\n                       href=\"{{baseUri}}/kubernetes/buildConfigs/{{step.buildConfig.metadata.name}}\">\n                      <i class=\"fa fa-cog\"></i>\n                      {{step.buildConfig.metadata.name}}\n                    </a>\n                  </span>\n                  &nbsp;&nbsp;&nbsp;\n                  <span class=\"pipeline-last-build\" ng-show=\"step.buildConfig.$lastBuild\">\n                    <a href=\"{{step.buildConfig.$lastBuild.$viewLink}}\" title=\"view this build\">\n                      <i class=\"fa fa-info\"></i>\n                      build\n                    </a>\n                  </span>\n\n                  <div class=\"ngCellText\" class=\"pipeline-last-build-time\"\n                       title=\"last build was at: {{step.buildConfig.$lastBuild.$creationDate | date : \'h:mm:ss a, EEE MMM yyyy\'}}\">\n                    <div ng-switch=\"step.buildConfig.$lastBuild.status\">\n                        <span ng-switch-when=\"New\" class=\"text-primary\">\n                          <i class=\"fa fa-spin fa-spinner\"></i> new: {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                        <span ng-switch-when=\"Pending\" class=\"text-primary\">\n                          <i class=\"fa fa-spin fa-spinner\"></i> pending: {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                        <span ng-switch-when=\"Running\" class=\"text-primary\">\n                          <i class=\"fa fa-spin fa-spinner\"></i> running {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                        <span ng-switch-when=\"Complete\" class=\"text-success\">\n                          <i class=\"fa fa-check-circle\"></i> completed {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                        <span ng-switch-when=\"Failed\" class=\"text-danger\">\n                          <i class=\"fa fa-exclamation-circle\"></i> failed {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                        <span ng-switch-default class=\"text-warning\">\n                          <i class=\"fa fa-exclamation-triangle\"></i> {{step.buildConfig.$lastBuild.status}}: {{step.buildConfig.$lastBuild.$creationDate.relative()}}\n                        </span>\n                    </div>\n                  </div>\n                  <div class=\"pipeline-last-build-logs\">\n                    <a href=\"{{step.buildConfig.$lastBuild.$logsLink}}\" title=\"view the logs of this build\">\n                      <i class=\"fa fa-file-text-o\"></i>\n                      logs\n                    </a>\n                  </div>\n                </div>\n              </div>\n              <div ng-switch-when=\"DeploymentConfig\">\n                <div class=\"col-md-1\">\n                  <div class=\"pipeline-arrow\">\n                    <i class=\"fa fa-long-arrow-right\"></i>\n                  </div>\n                </div>\n\n                <div class=\"col-md-2 pipeline-deploy\" title=\"Deployment Configuration\">\n                  <div class=\"pipeline-build-details\">\n                    <a title=\"View details for this deployment configuration\"\n                       href=\"{{baseUri}}/kubernetes/deploymentConfigs/{{step.buildConfig.metadata.name}}\">\n                      <i class=\"fa fa-cogs\"></i>\n                      {{step.buildConfig.metadata.name}}\n                    </a>\n                  </div>\n                  <div class=\"pipeline-deploy-pods\">\n                    <div class=\"pipeline-pod-counts\" ng-show=\"step.$podCounters\">pods:\n                      <a ng-show=\"step.$podCounters.podsLink\" target=\"pods\" href=\"{{step.$podCounters.podsLink}}\"\n                         title=\"View pods for this deployment\">\n                        <span class=\"badge badge-success\">{{step.$podCounters.ready}}</span>\n                        <span class=\"badge badge-info\">{{step.$podCounters.valid}}</span>\n                        <span ng-show=\"step.$podCounters.waiting\" class=\"badge\">{{step.$podCounters.waiting}}</span>\n                        <span ng-show=\"step.$podCounters.error\"\n                              class=\"badge badge-warning\">{{step.$podCounters.error}}</span>\n                      </a>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/pod.html","<div ng-controller=\"Kubernetes.PodController\">\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row row-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"model.fetched && !rawMode\" class=\"icon-heading\">\n          <i ng-show=\"item.$statusCss\" class=\"icon-selected-app fa {{item.$statusCss}}\"></i>\n\n          <img ng-show=\"item.$iconUrl\" class=\"icon-selected-app\" ng-src=\"{{item.$iconUrl}}\">&nbsp;{{item.metadata.name}}\n      </span>\n\n      <button class=\"btn btn-danger pull-right\"\n              title=\"Delete this Pod\"\n              ng-click=\"deleteEntity()\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/pods?namespace={{item.metadata.namespace}}\"><i class=\"fa fa-list\"></i></a>\n      <span ng-show=\"hasServiceKibana()\" class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"hasServiceKibana()\"\n              class=\"btn btn-default pull-right\"\n              title=\"View the logs for this pod\"\n              ng-click=\"openLogs()\">\n        <i class=\"fa fa-file-text-o\"></i> Logs\n      </button>\n\n      <a class=\"btn pull-right\"\n         ng-click=\"flipRaw()\"\n         title=\"{{rawMode ? \'Raw mode\' : \'Form mode\'}}\">{{rawMode ? \'From\' : \'Raw\'}}</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\"\n         href=\"/kubernetes/namespace/{{item.metadata.namespace}}/events?q=kind%3DPod%20name%3D{{item.metadata.name}}\"\n         title=\"View the events for this Pod\">\n        <i class=\"fa fa-ellipsis-v\"></i> Events\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <div ng-show=\"item.$jolokiaUrl && item.$ready\" ng-controller=\"Kubernetes.ConnectController\" class=\"pull-right\">\n        <span>&nbsp;</span>\n        <a class=\"btn btn-default pull-right\"\n           ng-click=\"doConnect(item)\"\n           title=\"Open a new window and connect to this container\">\n          <i class=\"fa fa-sign-in\"></i> Connect\n        </a>\n      </div>\n    </div>\n  </div>\n\n  <div ng-hide=\"model.fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div ng-show=\"model.fetched && !rawMode\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div hawtio-object=\"item\" config=\"itemConfig\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div ng-show=\"model.fetched && rawMode\">\n    <div class=\"raw-json-view\">\n      <textarea ui-codemirror=\"codeMirrorOptions\" readonly=\"true\" ng-model=\"rawModel\" class=\"raw-json-view\"></textarea>\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/podCreate.html","<div ng-controller=\"Kubernetes.PodEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the pods\"\n              href=\"{{baseUri}}/kubernetes/pods\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Create a new pod\"\n              ng-click=\"save()\">\n        Create Pod\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/podEdit.html","<div ng-controller=\"Kubernetes.PodEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the pods\"\n              href=\"{{baseUri}}/kubernetes/pods\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Saves changes to this pod\"\n              ng-click=\"save()\">\n        Save\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/pods.html","<div class=\"row\" ng-controller=\"Kubernetes.Pods\">\n  <script type=\"text/ng-template\" id=\"imageTemplate.html\">\n    <div class=\"ngCellText\">\n      <!-- in table -->\n      <span ng-hide=\"data\">\n        <span ng-repeat=\"container in row.entity.spec.containers\">\n          <span ng-hide=\"container.$imageLink\">{{container.image}}</span>\n          <a ng-show=\"container.$imageLink\" target=\"dockerRegistry\" href=\"{{container.$imageLink}}\" title=\"{{container.name}}\">{{container.image}}</a>\n        </span>\n      </span>\n      <!-- in detail view -->\n      <span ng-show=\"data\">\n        <a target=\"dockerRegistry\" ng-href=\"https://registry.hub.docker.com/u/{{data}}\" title=\"{{data}}\">{{data}}</a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"configDetail.html\">\n    <pre>{{data}}</pre>\n  </script>\n  <script type=\"text/ng-template\" id=\"envItemTemplate.html\">\n    <span ng-controller=\"Kubernetes.EnvItem\">\n      <span class=\"blue\">{{key}}</span>=<span class=\"green\">{{value}}</span>\n    </span>\n  </script>\n\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.pods.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter pods...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"model.fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"hasServiceKibana()\"\n              class=\"btn btn-primary pull-right\"\n              title=\"View the logs for the selected pods\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"openLogs()\">\n        <i class=\"fa fa-file-text-o\"></i> Logs\n      </button>\n      <span ng-show=\"hasServiceKibana()\" class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new pod\"\n              href=\"{{baseUri}}/kubernetes/namespace/{{namespace}}/podCreate\"><i class=\"fa fa-plus\"></i> Create</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <span ng-include=\"\'runButton.html\'\"></span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.pods.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no pods currently running.</p>\n        </div>\n        <div ng-show=\"model.pods.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/replicationController.html","<div ng-controller=\"Kubernetes.ReplicationControllerController\">\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row row-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"model.fetched && !rawMode\" class=\"icon-heading\">\n          <img ng-show=\"item.$iconUrl\" class=\"icon-selected-app\" ng-src=\"{{item.$iconUrl}}\">&nbsp;{{item.metadata.name}}\n      </span>\n\n      <button class=\"btn btn-danger pull-right\"\n              title=\"Delete this ReplicationController\"\n              ng-click=\"deleteEntity()\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-default pull-right\"\n         title=\"Return to table of controllers\"\n              href=\"{{baseUri}}/kubernetes/replicationControllers?namespace={{item.metadata.namespace}}\"><i class=\"fa fa-list\"></i></a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn pull-right\"\n         ng-click=\"flipRaw()\"\n         title=\"{{rawMode ? \'Raw mode\' : \'Form mode\'}}\">{{rawMode ? \'From\' : \'Raw\'}}</a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-default pull-right\"\n              ng-click=\"resizeDialog.open(item)\"\n              title=\"Scale this controller, changing the number of pods you wish to run\">\n        <i class=\"fa fa-server\"></i> Scale\n      </a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-primary pull-right\"\n         href=\"/kubernetes/namespace/{{item.metadata.namespace}}/events?q=kind%3DReplicationController%20name%3D{{item.metadata.name}}\"\n         title=\"View the events for this Replication Controller\">\n        <i class=\"fa fa-ellipsis-v\"></i> Events\n      </a>\n\n      <span class=\"pull-right controller-pod-counts\" ng-show=\"item.$podCounters\">Pods:\n        <a ng-show=\"item.$podCounters.podsLink\" href=\"{{item.$podCounters.podsLink}}\" title=\"View pods\">\n          <span ng-show=\"item.$podCounters.ready\" class=\"badge badge-success\">{{item.$podCounters.ready}}</span>\n          <span ng-show=\"item.$podCounters.valid\" class=\"badge badge-info\">{{item.$podCounters.valid}}</span>\n          <span ng-show=\"item.$podCounters.waiting\" class=\"badge\">{{item.$podCounters.waiting}}</span>\n          <span ng-show=\"item.$podCounters.error\" class=\"badge badge-warning\">{{item.$podCounters.error}}</span>\n        </a>\n      </span>\n    </div>\n  </div>\n\n  <div ng-hide=\"model.fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div ng-show=\"model.fetched && !rawMode\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div hawtio-object=\"item\" config=\"itemConfig\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div ng-show=\"model.fetched && rawMode\">\n    <div class=\"raw-json-view\">\n      <textarea ui-codemirror=\"codeMirrorOptions\" readonly=\"true\" ng-model=\"rawModel\" class=\"\"></textarea>\n    </div>\n  </div>\n\n  <ng-include src=\"\'resizeDialog.html\'\"/>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/replicationControllerCreate.html","<div ng-controller=\"Kubernetes.ReplicationControllerEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the replication controllers\"\n              href=\"{{baseUri}}/kubernetes/replicationControllers\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Create a new controller\"\n              ng-click=\"save()\">\n        Create Controller\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/replicationControllerEdit.html","<div ng-controller=\"Kubernetes.ReplicationControllerEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the replication controllers\"\n              href=\"{{baseUri}}/kubernetes/replicationControllers\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Saves changes to the controller\"\n              ng-click=\"save()\">\n        Save\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/replicationControllers.html","<div ng-controller=\"Kubernetes.ReplicationControllers\">\n  <script type=\"text/ng-template\" id=\"currentReplicasTemplate.html\">\n    <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n      <a ng-show=\"row.entity.podsLink\" href=\"{{row.entity.podsLink}}\">\n        <span class=\"badge {{row.entity.status.replicas > 0 ? \'badge-success\' : \'badge-warning\'}}\">{{row.entity.status.replicas}}</span>\n      </a>\n      <span ng-hide=\"row.entity.podsLink\" class=\"badge\">{{row.entity.status.replicas}}</span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"desiredReplicas.html\">\n    <div class=\"ngCellText\">\n      <a href=\"\" class=\"badge badge-info\" \n         ng-click=\"$parent.$parent.resizeDialog.open(row.entity)\" \n         title=\"Edit the number of replicas of this controller\">{{row.entity.spec.replicas || 0}}</a>\n    </div>\n  </script>\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.replicationControllers.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter replication controllers...\"\n                       save-as=\"kubernetes-replication-controllers-text-filter\"></hawtio-filter>\n      </span>\n      <button ng-show=\"model.fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      <span ng-show=\"id\" class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new replication controller\"\n              href=\"{{baseUri}}/kubernetes/namespace/{{namespace}}/replicationControllerCreate\"><i class=\"fa fa-plus\"></i> Create</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <span ng-include=\"\'runButton.html\'\"></span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.replicationControllers.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no replication controllers currently available.</p>\n        </div>\n        <div ng-show=\"model.replicationControllers.length\">\n          <table class=\"table table-condensed table-striped\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n  <ng-include src=\"\'resizeDialog.html\'\"/>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/secret.html","<div ng-controller=\"Kubernetes.SecretController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <button class=\"btn btn-default pull-right\"\n              title=\"Cancel changes to this secret\"\n              ng-click=\"cancel()\">\n        Cancel\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Saves changes to this secret\"\n              ng-disabled=\"!entity.name || !changed\"\n              ng-click=\"save()\">\n        Save Changes\n      </button>\n    </div>\n  </div>\n\n  <div ng-hide=\"fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div ng-show=\"fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <form name=\"secretForm\" class=\"form-horizontal\">\n          <div class=\"form-group\" ng-hide=\"id\"  ng-class=\"{\'has-error\': secretForm.$error.validator}\">\n            <label class=\"col-sm-2 control-label\" for=\"secretName\">\n              Name\n              <a tabindex=\"0\" role=\"button\" data-toggle=\"popover\" data-trigger=\"focus\" data-html=\"true\" title=\"\"\n                 data-content=\"name of the secret\" data-placement=\"top\" data-original-title=\"\">\n                <span class=\"fa fa-info-circle\"></span>\n              </a>\n            </label>\n\n            <div class=\"col-sm-10\">\n              <input type=\"text\" id=\"secretName\" name=\"secretName\" ng-model=\"entity.name\" ng-change=\"entityChanged()\" class=\"form-control\"\n                     ui-validate=\"\'checkNameUnique($value)\'\"\n                     required=\"required\">\n              <span class=\"help-block\" ng-show=\"secretForm.secretName.$error.validator\">\n                There is already a secret with that name!\n              </span>\n            </div>\n          </div>\n\n          <div class=\"form-group\" ng-repeat=\"property in entity.properties track by $index\">\n            <label class=\"col-sm-2 control-label\" for=\"{{property.key}}\">\n              {{property.label}}\n              <a tabindex=\"0\" role=\"button\" data-toggle=\"popover\" data-trigger=\"focus\" data-html=\"true\" title=\"\"\n                 data-content=\"{{property.description}}\" data-placement=\"top\" data-original-title=\"\">\n                <span class=\"fa fa-info-circle\"></span>\n              </a>\n            </label>\n\n            <div class=\"col-sm-9\" ng-switch=\"property.type\">\n              <textarea ng-switch-when=\"textarea\" class=\"form-control\" rows=\"{{property.rows}}\" id=\"{{property.key}}\" ng-change=\"entityChanged()\"\n                        ng-model=\"entity.properties[property.key].value\"></textarea>\n              <input ng-switch-default=\"\" type=\"{{property.type}}\" class=\"form-control\" id=\"{{property.key}}\" ng-change=\"entityChanged()\"\n                        ng-model=\"entity.properties[property.key].value\">\n            </div>\n\n            <div class=\"col-sm-1\">\n              <button class=\"btn btn-danger pull-right\" ng-click=\"deleteProperty(property.key)\"\n                      title=\"Remove this property from the secret\">\n                <i class=\"fa fa-remove\"></i>\n              </button>\n            </div>\n          </div>\n        </form>\n\n\n        <div class=\"form-group\" ng-show=\"entity.name\">\n          <div class=\"col-sm-12\">\n            <div class=\"text-center\">\n              <button class=\"btn btn-default btn-padding\" ng-click=\"addFields(httpsKeys)\" ng-hide=\"hasAllKeys(httpsKeys)\"\n                      title=\"Adds fields to store HTTPS user and password fields\">\n                <i class=\"fa fa-plus\"></i> HTTPS User &amp; Password Fields\n              </button>\n              <button class=\"btn btn-default btn-padding\" ng-click=\"addFields(sshKeys)\" ng-hide=\"hasAllKeys(sshKeys)\"\n                      title=\"Adds the fields to store SSH private and public keys\">\n                <i class=\"fa fa-plus\"></i> SSH Key Fields\n              </button>\n              <button class=\"btn btn-default btn-padding\" ng-click=\"addFieldDialog.dialog.open()\"\n                      title=\"Adds a new data field to store new data in this secret\">\n                <i class=\"fa fa-plus\"></i> Custom Field\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div modal=\"addFieldDialog.dialog.show\">\n    <form name=\"addDataFieldForm\" class=\"\" ng-submit=\"addFieldDialog.onOk()\">\n      <div class=\"modal-header\"><h4>Add New Data Field</h4></div>\n      <div class=\"modal-body\">\n\n        <div class=\"form-group\" ng-class=\"{\'has-error\': addDataFieldForm.$invalid}\">\n          <label class=\"col-sm-2 control-label\" for=\"newDataName\">\n            Name\n            <a tabindex=\"0\" role=\"button\" data-toggle=\"popover\" data-trigger=\"focus\" data-html=\"true\" title=\"\"\n               data-content=\"name of the new field to add to the secret\" data-placement=\"top\" data-original-title=\"\">\n              <span class=\"fa fa-info-circle\"></span>\n            </a>\n          </label>\n\n          <div class=\"col-sm-10\">\n            <input type=\"text\" id=\"newDataName\" name=\"newDataName\" ng-model=\"entity.newDataKey\" class=\"form-control\"\n                   ui-validate=\"\'checkFieldUnique($value)\'\"\n                   typeahead=\"title for title in propertyKeys() | filter:$viewValue\"\n                   typeahead-editable=\"true\"\n                   autocomplete=\"off\"\n                   title=\"name of the new field to add to the secret\"\n                   placeholder=\"new data field name\">\n\n            <span class=\"help-block\" ng-show=\"addDataFieldForm.newDataName.$error.validator\">\n              That field name is already in use!\n            </span>\n          </div>\n        </div>\n\n        <hr/>\n\n        <div class=\"form-group\">\n          <div class=\"col-sm-12\">\n              <span class=\"help-block\">\n                Enter the name of the new data field to add to the secret\n              </span>\n          </div>\n        </div>\n      </div>\n      <div class=\"modal-footer\">\n        <input class=\"btn btn-primary\" type=\"submit\"\n               ng-disabled=\"!entity.newDataKey\"\n               value=\"Add\">\n\n        <button class=\"btn btn-warning cancel\" type=\"button\" ng-click=\"addFieldDialog.close()\">Cancel</button>\n      </div>\n    </form>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/secrets.html","<div class=\"row\" ng-controller=\"Kubernetes.SecretsController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-show=\"model.secrets.length\"\n                       ng-model=\"tableConfig.filterOptions.filterText\"\n                       save-as=\"kubernetes-secrets-text-filter\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter secrets...\"></hawtio-filter>\n\n        <button class=\"btn btn-danger pull-right\"\n                title=\"Deletes the selected secrets\"\n                ng-disabled=\"!tableConfig.selectedItems.length\"\n                ng-click=\"deletePrompt(tableConfig.selectedItems)\">\n          <i class=\"fa fa-remove\"></i> Delete\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <a class=\"btn btn-primary pull-right\"\n           title=\"Create a new secret\"\n           ng-show=\"$createSecretLink\" href=\"{{$createSecretLink}}\">\n          <i class=\"fa fa-plus\"></i> Create\n        </a>\n      </span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.secrets.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no secrets currently available.</p>\n        </div>\n        <div ng-show=\"model.secrets.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/service.html","<div ng-controller=\"Kubernetes.ServiceController\">\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row row-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"model.fetched && !rawMode\" class=\"icon-heading\">\n          <img ng-show=\"item.$iconUrl\" class=\"icon-selected-app\" ng-src=\"{{item.$iconUrl}}\">&nbsp;{{item.metadata.name}}\n      </span>\n\n      <button class=\"btn btn-danger pull-right\"\n              title=\"Delete this Service\"\n              ng-click=\"deleteEntity()\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-default pull-right\"\n              href=\"{{baseUri}}/kubernetes/services?namespace={{item.metadata.namespace}}\"><i class=\"fa fa-list\"></i></a>\n\n      <a class=\"btn pull-right\"\n         ng-click=\"flipRaw()\"\n         title=\"{{rawMode ? \'Raw mode\' : \'Form mode\'}}\">{{rawMode ? \'From\' : \'Raw\'}}</a>\n      <span class=\"pull-right\">&nbsp;</span>\n\n      <a class=\"btn btn-primary pull-right\"\n         title=\"Open this service in your browser\"\n         ng-show=\"item.$connectUrl\" href=\"{{item.$connectUrl}}\">\n        <i class=\"fa fa-sign-in\"></i> Connect\n      </a>\n    </div>\n  </div>\n\n  <div ng-hide=\"model.fetched\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div ng-show=\"model.fetched && !rawMode\">\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div hawtio-object=\"item\" config=\"itemConfig\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div ng-show=\"model.fetched && rawMode\">\n    <div class=\"raw-json-view\">\n      <textarea ui-codemirror=\"codeMirrorOptions\" readonly=\"true\" ng-model=\"rawModel\" class=\"raw-json-view\"></textarea>\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/serviceApps.html","<div class=\"dropdown\" ng-controller=\"Kubernetes.ServiceApps\">\n  <a href=\"\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n    <i class=\"fa fa-ellipsis-v\" title=\"View the available tools\"></i>\n  </a>\n  <ul class=\"dropdown-menu right k8sServiceApp-menu\">\n    <li class=\"k8sServiceApp\" \n        ng-repeat=\"service in model.serviceApps | filter:filterTemplates | orderBy:\'metadata.name\' track by $index\">\n        <a href=\"{{service.$connectUrl}}\"\n         target=\"_blank\"\n         title=\"Click to open this app\">\n        <img style=\"width: 32px; height: 32px;\" ng-src=\"{{service.$iconUrl}}\">&nbsp;\n        <span ng-bind=\"service.metadata.name\"></span>\n      </a>\n    </li>\n  </ul>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/serviceCreate.html","<div ng-controller=\"Kubernetes.ServiceEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the services\"\n              href=\"{{baseUri}}/kubernetes/services\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Create a new service\"\n              ng-click=\"save()\">\n        Create Service\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/serviceEdit.html","<div ng-controller=\"Kubernetes.ServiceEditController\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <span class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Go back to viewing all the services\"\n              href=\"{{baseUri}}/kubernetes/services\"><i class=\"fa fa-list\"></i></a>\n      <button class=\"btn btn-primary pull-right\"\n              title=\"Save changes to this service\"\n              ng-click=\"save()\">\n        Save\n      </button>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched\">\n        <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/services.html","<div ng-controller=\"Kubernetes.Services\">\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\" ng-show=\"model.services.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter services...\"\n                       save-as=\"kubernetes-services-text-filter\"></hawtio-filter>\n      </span>\n      <span ng-hide=\"id\" class=\"pull-right\">\n        <div class=\"btn-group\">\n          <a class=\"btn\" ng-disabled=\"mode == \'list\'\" href=\"\" ng-click=\"mode = \'list\'\">\n            <i class=\"fa fa-list\"></i></a>\n          <a class=\"btn\" ng-disabled=\"mode == \'icon\'\" href=\"\" ng-click=\"mode = \'icon\'\">\n            <i class=\"fa fa-table\"></i></a>\n        </div>\n      </span>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"model.fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"fa fa-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"fa fa-list\"></i></button>\n      <span ng-show=\"id\" class=\"pull-right\">&nbsp;</span>\n      <a class=\"btn btn-default pull-right\"\n         title=\"Create a new service\"\n              href=\"{{baseUri}}/kubernetes/namespace/{{namespace}}/serviceCreate\"><i class=\"fa fa-plus\"></i> Create</a>\n      <span class=\"pull-right\">&nbsp;</span>\n      <span ng-include=\"\'runButton.html\'\"></span>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div ng-hide=\"model.fetched\">\n        <div class=\"align-center\">\n          <i class=\"fa fa-spinner fa-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"model.fetched\">\n        <div ng-hide=\"model.services.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no services currently available.</p>\n        </div>\n        <div ng-show=\"model.services.length\">\n          <div ng-show=\"mode == \'list\'\">\n            <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                   hawtio-simple-table=\"tableConfig\"></table>\n          </div>\n\n          <div ng-hide=\"mode == \'list\'\">\n            <div class=\"column-box\"\n                 ng-repeat=\"service in model.serviceApps | filter:filterTemplates | orderBy:\'metadata.name\' track by $index\">\n              <div class=\"row\">\n                <div class=\"col-md-2\">\n                  <a href=\"{{service.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <img style=\"width: 64px; height: 64px;\" ng-src=\"{{service.$iconUrl}}\">\n                  </a>\n                </div>\n                <div class=\"col-md-9\">\n                  <a href=\"{{service.$serviceUrl}}\"\n                     target=\"_blank\"\n                     title=\"Click to open this app\">\n                    <h3 ng-bind=\"service.metadata.name\"></h3>\n                  </a>\n                </div>\n<!--\n                <div class=\"col-md-1\">\n                  <a href=\"\" ng-click=\"deleteService(service)\"><i class=\"fa fa-remove red\"></i></a>\n                </div>\n-->\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/tabs.html","<div ng-show=\"subTabConfig\" ng-init=\"subTabConfig = $parent.subTabConfig\" class=\"breadcrumb-tabs\"\n     ng-controller=\"Developer.NavBarController\">\n  <ul class=\"nav navbar-nav nav-tabs\">\n    <li ng-repeat=\"breadcrumb in subTabConfig\" ng-show=\"isValid(breadcrumb)\"\n        class=\"{{breadcrumb.active ? \'active\' : \'\'}}\"\n        title=\"{{breadcrumb.title}}\">\n        <a href=\"{{breadcrumb.href}}\">{{breadcrumb.label}}</a>\n    </li>\n  </ul>\n<div class=\"pull-right inline-block\"\n        ng-show=\"model.serviceApps && model.serviceApps.length\"\n        ng-include=\"\'plugins/kubernetes/html/serviceApps.html\'\"></div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/templateDescription.html","<div class=\"modal-header\">\n  <h3 class=\"modal-title\">Description</h3>\n</div>\n<div class=\"modal-body\">\n  <div compile=\"text\"></div>\n</div>\n<div class=\"modal-footer\">\n  <button class=\"btn btn-primary\" ng-click=\"ok()\">Close</button>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/templates.html","<div ng-controller=\"Kubernetes.TemplateController\">\n  <script type=\"text/ng-template\" id=\"truncatedDescriptionTag.html\">\n    <a href=\"\" ng-click=\"openFullDescription(template)\">More...</a>\n  </script>\n\n  <div class=\"row\">\n    <div hawtio-breadcrumbs></div>\n  </div>\n\n  <div class=\"row\">\n    <div hawtio-tabs></div>\n  </div>\n\n\n  <div class=\"row filter-header\">\n    <div class=\"col-md-12\">\n      <span ng-show=\"model.templates.length && !formConfig\">\n        <hawtio-filter ng-model=\"filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter templates...\"></hawtio-filter>\n      </span>\n\n      <button ng-show=\"formConfig\" \n        class=\"btn btn-success pull-right\"\n        title=\"Click to deploy this app\" \n        ng-click=\"substituteAndDeployTemplate()\">\n        <i class=\"fa fa-play-circle\"></i> Run\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button class=\"btn btn-info pull-right\"\n              ng-click=\"cancel()\"\n              title=\"Go back to app view\">\n              Cancel\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <span class=\"pull-right\">\n        Target namespace: <select ng-model=\"targetNamespace\" ng-options=\"namespace for namespace in model.namespaces\" title=\"Select the namespace to deploy these objects in\">\n    </select>\n\n      </span>\n    </div>\n  </div>\n  <div class=\"row\" ng-hide=\"formConfig || model.templates.length != 0\">\n    <div class=\"col-md-12\">\n      <div class=\"alert alert-info centered\">\n        There are no templates currently available.  Add templates by dragging and dropping template files into this area.\n      </div>\n    </div>\n  </div>\n  <div class=\"row\" ng-hide=\"formConfig\">\n    <div class=\"col-md-12\">\n      <div class=\"column-box\" \n           ng-repeat=\"template in model.templates | filter:filterTemplates | orderBy:\'metadata.name\' track by $index\">\n          <div class=\"row\">\n            <div class=\"col-md-2\">\n              <img style=\"width: 64px; height: 64px;\" ng-src=\"{{getIconUrl(template)}}\">\n            </div>\n            <div class=\"col-md-9\">\n              <h3 ng-bind=\"template.metadata.name\"></h3>\n            </div>\n            <div class=\"col-md-1\">\n              <a href=\"\" ng-click=\"deleteTemplate(template)\"><i class=\"fa fa-remove red\"></i></a>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-10\">\n              <div compile=\"getDescription(template)\"></div>\n            </div>\n            <div class=\"col-md-2\">\n              <a href=\"\" \n                 title=\"Click to deploy this app\" \n                 ng-click=\"deployTemplate(template)\">\n                <i class=\"fa fa-play-circle green fa-3x\"></i>\n              </a>\n            </div>\n          </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\" ng-show=\"formConfig\">\n    <div class=\"col-md-4\">\n    </div>\n    <div class=\"col-md-4\">\n      <div hawtio-form-2=\"formConfig\" entity=\"entity\"></div>\n    </div>\n    <div class=\"col-md-4\">\n    </div>\n\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/termShell.html","<div class=\"terminal-window\" terminal-window ng-click=\"raise()\">\n  <div class=\"terminal-title\">\n    <h5 ng-bind=\"containerName\"></h5>\n    <i class=\"fa fa-remove pull-right clickable\" title=\"Close and exit this terminal\" ng-click=\"close()\"></i>\n    <i class=\"fa fa-toggle-down pull-right clickable\" title=\"Minimize this terminal\" ng-click=\"minimize()\"></i>\n  </div>\n  <div class=\"terminal-body\">\n  </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-kubernetes-templates");