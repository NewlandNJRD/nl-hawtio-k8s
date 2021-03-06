/// <reference path="../defs.d.ts"/>

/// <reference path="../../includes.ts"/>
var Forms1Tests;
(function (Forms1Tests) {
    var pluginName = 'hawtio-forms1-tests';
    var log = Logger.get(pluginName);
    var tp = 'test-plugins/form1-examples/html';
    var _module = angular.module(pluginName, []);
    var tab = null;
    _module.config(['$routeProvider', 'HawtioNavBuilderProvider', function ($routeProvider, builder) {
            tab = builder.create()
                .id(pluginName)
                .rank(1)
                .title(function () { return "Forms"; })
                .href(function () { return "/forms"; })
                .subPath("Simple Form", "simple_form", builder.join(tp, "test.html"), 1)
                .subPath("Form Table", "form_table", builder.join(tp, "testTable.html"), 2)
                .subPath("Wizard", "form_wizard", builder.join(tp, "wizard.html"), 3)
                .build();
            builder.configureRouting($routeProvider, tab);
        }]);
    _module.run(["HawtioNav", "SchemaRegistry", function (nav, schemas) {
            nav.add(tab);
        }]);
    _module.controller("HawtioFormsTests.WizardController", ["$scope", "$templateCache", function ($scope, $templateCache) {
            $scope.wizardConfig = {
                "properties": {
                    "key": {
                        "description": "Argument key",
                        "type": "java.lang.String"
                    },
                    "value": {
                        "description": "Argument Value",
                        "type": "java.lang.String"
                    },
                    "longArg": {
                        "description": "Long argument",
                        "type": "Long",
                        "minimum": "5",
                        "maximum": "10"
                    },
                    "intArg": {
                        "description": "Int argument",
                        "type": "Integer"
                    },
                    "objectArg": {
                        "description": "some object",
                        "type": "object"
                    },
                    "booleanArg": {
                        "description": "Some boolean value",
                        "type": "java.lang.Boolean"
                    }
                },
                "description": "My awesome wizard!",
                "type": "java.lang.String",
                "wizard": {
                    "Page One": ["key", "value"],
                    "Page Two": ["*"],
                    "Page Three": ["booleanArg"]
                }
            };
            $scope.wizardConfigStr = angular.toJson($scope.wizardConfig, true);
            $scope.wizardMarkup = $templateCache.get("wizardMarkup.html");
            $scope.$watch('wizardConfigStr', _.debounce(function () {
                try {
                    $scope.wizardConfig = angular.fromJson($scope.wizardConfigStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    _module.controller("Forms.FormTestController", ["$scope", function ($scope) {
            $scope.editing = false;
            $scope.html = "text/html";
            $scope.javascript = "javascript";
            $scope.basicFormEx1Entity = {
                'key': 'Some key',
                'value': 'Some value'
            };
            $scope.basicFormEx1EntityString = angular.toJson($scope.basicFormEx1Entity, true);
            $scope.basicFormEx1Result = '';
            $scope.toggleEdit = function () {
                $scope.editing = !$scope.editing;
            };
            $scope.view = function () {
                if (!$scope.editing) {
                    return "view";
                }
                return "edit";
            };
            $scope.basicFormEx1 = '<div simple-form name="some-form" action="#/forms/test" method="post" data="basicFormEx1SchemaObject" entity="basicFormEx1Entity" onSubmit="callThis()"></div>';
            $scope.toObject = function (str) {
                return angular.fromJson(str.replace("'", "\""));
            };
            $scope.fromObject = function (str) {
                return angular.toJson($scope[str], true);
            };
            $scope.basicFormEx1Config = {
                "properties": {
                    "key": {
                        "description": "Argument key",
                        "type": "java.lang.String"
                    },
                    "value": {
                        "description": "Argument Value",
                        "type": "java.lang.String"
                    },
                    "longArg": {
                        "description": "Long argument",
                        "type": "Long",
                        "minimum": "5",
                        "maximum": "10"
                    },
                    "intArg": {
                        "description": "Int argument",
                        "type": "Integer"
                    },
                    "objectArg": {
                        "description": "some object",
                        "type": "object"
                    },
                    "booleanArg": {
                        "description": "Some boolean value",
                        "type": "java.lang.Boolean"
                    }
                },
                "description": "Show some stuff in a form",
                "type": "java.lang.String",
                "tabs": {
                    "Tab One": ["key", "value"],
                    "Tab Two": ["*"],
                    "Tab Three": ["booleanArg"]
                }
            };
            $scope.basicFormEx1Schema = angular.toJson($scope.basicFormEx1Config, true);
            $scope.basicFormEx1SchemaObject = $scope.toObject($scope.basicFormEx1Schema);
            $scope.updateSchema = function () {
                $scope.basicFormEx1SchemaObject = $scope.toObject($scope.basicFormEx1Schema);
            };
            $scope.updateEntity = function () {
                $scope.basicFormEx1Entity = angular.fromJson($scope.basicFormEx1EntityString);
            };
            $scope.hawtioResetEx = '<a class="btn" href="" hawtio-reset="some-form"><i class="icon-refresh"></i> Clear</a>';
            $scope.hawtioSubmitEx = '      <a class="btn" href="" hawtio-submit="some-form"><i class="icon-save"></i> Save</a>';
            $scope.callThis = function (json, form) {
                $scope.basicFormEx1Result = angular.toJson(json, true);
                Core.notification('success', 'Form "' + form.get(0).name + '" submitted...');
                Core.$apply($scope);
            };
            $scope.config = {
                name: 'form-with-config-object',
                action: "/some/url",
                method: "post",
                data: 'setVMOption',
                showtypes: 'false'
            };
            $scope.cheese = {
                key: "keyABC",
                value: "valueDEF",
                intArg: 999
            };
            $scope.onCancel = function (form) {
                Core.notification('success', 'Cancel clicked on form "' + form.get(0).name + '"');
            };
            $scope.onSubmit = function (json, form) {
                Core.notification('success', 'Form "' + form.get(0).name + '" submitted... (well not really), data:' + JSON.stringify(json));
            };
            $scope.derp = function (json, form) {
                Core.notification('error', 'derp with json ' + JSON.stringify(json));
            };
            $scope.inputTableData = {
                rows: [
                    { id: "object1", name: 'foo' },
                    { id: "object2", name: 'bar' }
                ]
            };
            $scope.inputTableConfig = {
                data: 'inputTableData.rows',
                displayFooter: false,
                showFilter: false,
                showSelectionCheckbox: false,
                enableRowClickSelection: true,
                primaryKeyProperty: 'id',
                properties: {
                    'rows': { items: { type: 'string', properties: {
                                'id': {
                                    description: 'Object ID',
                                    type: 'java.lang.String'
                                },
                                'name': {
                                    description: 'Object Name',
                                    type: 'java.lang.String'
                                }
                            } } }
                },
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID'
                    },
                    {
                        field: 'name',
                        displayName: 'Name'
                    }
                ]
            };
        }]);
    hawtioPluginLoader.addModule(pluginName);
})(Forms1Tests || (Forms1Tests = {}));

var Kubernetes;
(function (Kubernetes) {
    Kubernetes.schema = {
        "$schema": "http://json-schema.org/schema#",
        "additionalProperties": true,
        "definitions": {
            "docker_Config": {
                "additionalProperties": true,
                "javaType": "io.fabric8.docker.client.dockerclient.Config",
                "properties": {
                    "AttachStderr": {
                        "type": "boolean"
                    },
                    "AttachStdin": {
                        "type": "boolean"
                    },
                    "AttachStdout": {
                        "type": "boolean"
                    },
                    "Cmd": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "CpuSet": {
                        "type": "string"
                    },
                    "CpuShares": {
                        "type": "integer"
                    },
                    "Dns": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "Domainname": {
                        "type": "string"
                    },
                    "Entrypoint": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "Env": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "ExposedPorts": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,Object>",
                        "type": "object"
                    },
                    "Hostname": {
                        "type": "string"
                    },
                    "Image": {
                        "type": "string"
                    },
                    "Memory": {
                        "type": "integer"
                    },
                    "MemorySwap": {
                        "type": "integer"
                    },
                    "NetworkDisabled": {
                        "type": "boolean"
                    },
                    "OpenStdin": {
                        "type": "boolean"
                    },
                    "PortSpecs": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "StdinOnce": {
                        "type": "boolean"
                    },
                    "Tty": {
                        "type": "boolean"
                    },
                    "User": {
                        "type": "string"
                    },
                    "Volumes": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,Object>",
                        "type": "object"
                    },
                    "VolumesFrom": {
                        "type": "string"
                    },
                    "WorkingDir": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "docker_Image": {
                "additionalProperties": true,
                "javaType": "io.fabric8.docker.client.dockerclient.Image",
                "properties": {
                    "Architecture": {
                        "type": "string"
                    },
                    "Author": {
                        "type": "string"
                    },
                    "Comment": {
                        "type": "string"
                    },
                    "Config": {
                        "$ref": "#/definitions/docker_Config",
                        "javaType": "io.fabric8.docker.client.dockerclient.Config"
                    },
                    "Container": {
                        "type": "string"
                    },
                    "ContainerConfig": {
                        "$ref": "#/definitions/docker_Config",
                        "javaType": "io.fabric8.docker.client.dockerclient.Config"
                    },
                    "Created": {
                        "type": "string"
                    },
                    "DockerVersion": {
                        "type": "string"
                    },
                    "Id": {
                        "type": "string"
                    },
                    "Parent": {
                        "type": "string"
                    },
                    "Size": {
                        "type": "integer"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_Container": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Container",
                "properties": {
                    "command": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "cpu": {
                        "$ref": "#/definitions/kubernetes_resource_Quantity",
                        "javaType": "io.fabric8.kubernetes.api.model.resource.Quantity"
                    },
                    "env": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.base.EnvVar"
                        },
                        "type": "array"
                    },
                    "image": {
                        "type": "string"
                    },
                    "imagePullPolicy": {
                        "type": "string"
                    },
                    "lifecycle": {
                        "$ref": "#/definitions/kubernetes_base_Lifecycle",
                        "javaType": "io.fabric8.kubernetes.api.model.base.Lifecycle"
                    },
                    "livenessProbe": {
                        "$ref": "#/definitions/kubernetes_base_LivenessProbe",
                        "javaType": "io.fabric8.kubernetes.api.model.base.LivenessProbe"
                    },
                    "memory": {
                        "$ref": "#/definitions/kubernetes_resource_Quantity",
                        "javaType": "io.fabric8.kubernetes.api.model.resource.Quantity"
                    },
                    "name": {
                        "type": "string"
                    },
                    "ports": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_Port",
                            "javaType": "io.fabric8.kubernetes.api.model.base.Port"
                        },
                        "type": "array"
                    },
                    "privileged": {
                        "type": "boolean"
                    },
                    "terminationMessagePath": {
                        "type": "string"
                    },
                    "volumeMounts": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_VolumeMount",
                            "javaType": "io.fabric8.kubernetes.api.model.base.VolumeMount"
                        },
                        "type": "array"
                    },
                    "workingDir": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_EmptyDir": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.EmptyDir",
                "type": "object"
            },
            "kubernetes_base_EnvVar": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.EnvVar",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_ExecAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.ExecAction",
                "properties": {
                    "command": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_GCEPersistentDisk": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.GCEPersistentDisk",
                "properties": {
                    "fsType": {
                        "type": "string"
                    },
                    "partition": {
                        "type": "integer"
                    },
                    "pdName": {
                        "type": "string"
                    },
                    "readOnly": {
                        "type": "boolean"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_GitRepo": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.GitRepo",
                "properties": {
                    "repository": {
                        "type": "string"
                    },
                    "revision": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_HTTPGetAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.HTTPGetAction",
                "properties": {
                    "host": {
                        "type": "string"
                    },
                    "path": {
                        "type": "string"
                    },
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_Handler": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Handler",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_base_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.base.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_base_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.base.HTTPGetAction"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_HostDir": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.HostDir",
                "properties": {
                    "path": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_Lifecycle": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Lifecycle",
                "properties": {
                    "postStart": {
                        "$ref": "#/definitions/kubernetes_base_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.base.Handler"
                    },
                    "preStop": {
                        "$ref": "#/definitions/kubernetes_base_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.base.Handler"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_ListMeta": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.ListMeta",
                "properties": {
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_LivenessProbe": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.LivenessProbe",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_base_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.base.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_base_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.base.HTTPGetAction"
                    },
                    "initialDelaySeconds": {
                        "type": "integer"
                    },
                    "tcpSocket": {
                        "$ref": "#/definitions/kubernetes_base_TCPSocketAction",
                        "javaType": "io.fabric8.kubernetes.api.model.base.TCPSocketAction"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_ObjectMeta": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.ObjectMeta",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_ObjectReference": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.ObjectReference",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "fieldPath": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_PodSpec": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.PodSpec",
                "properties": {
                    "containers": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_Container",
                            "javaType": "io.fabric8.kubernetes.api.model.base.Container"
                        },
                        "type": "array"
                    },
                    "dnsPolicy": {
                        "type": "string"
                    },
                    "host": {
                        "type": "string"
                    },
                    "nodeSelector": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "restartPolicy": {
                        "$ref": "#/definitions/kubernetes_base_RestartPolicy",
                        "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicy"
                    },
                    "volumes": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_Volume",
                            "javaType": "io.fabric8.kubernetes.api.model.base.Volume"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_PodTemplateSpec": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.PodTemplateSpec",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "spec": {
                        "$ref": "#/definitions/kubernetes_base_PodSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.base.PodSpec"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_Port": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Port",
                "properties": {
                    "containerPort": {
                        "type": "integer"
                    },
                    "hostIP": {
                        "type": "string"
                    },
                    "hostPort": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "string"
                    },
                    "protocol": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_ReplicationControllerSpec": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.ReplicationControllerSpec",
                "properties": {
                    "replicas": {
                        "type": "integer"
                    },
                    "selector": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "template": {
                        "$ref": "#/definitions/kubernetes_base_PodTemplateSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.base.PodTemplateSpec"
                    },
                    "templateRef": {
                        "$ref": "#/definitions/kubernetes_base_ObjectReference",
                        "javaType": "io.fabric8.kubernetes.api.model.base.ObjectReference"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_RestartPolicy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicy",
                "properties": {
                    "always": {
                        "$ref": "#/definitions/kubernetes_base_RestartPolicyAlways",
                        "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyAlways"
                    },
                    "never": {
                        "$ref": "#/definitions/kubernetes_base_RestartPolicyNever",
                        "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyNever"
                    },
                    "onFailure": {
                        "$ref": "#/definitions/kubernetes_base_RestartPolicyOnFailure",
                        "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyOnFailure"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_RestartPolicyAlways": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyAlways",
                "type": "object"
            },
            "kubernetes_base_RestartPolicyNever": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyNever",
                "type": "object"
            },
            "kubernetes_base_RestartPolicyOnFailure": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.RestartPolicyOnFailure",
                "type": "object"
            },
            "kubernetes_base_Status": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Status",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "code": {
                        "type": "integer"
                    },
                    "details": {
                        "$ref": "#/definitions/kubernetes_base_StatusDetails",
                        "javaType": "io.fabric8.kubernetes.api.model.base.StatusDetails"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "reason": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_StatusCause": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.StatusCause",
                "properties": {
                    "field": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "reason": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_StatusDetails": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.StatusDetails",
                "properties": {
                    "causes": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_StatusCause",
                            "javaType": "io.fabric8.kubernetes.api.model.base.StatusCause"
                        },
                        "type": "array"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_TCPSocketAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.TCPSocketAction",
                "properties": {
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_TypeMeta": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.TypeMeta",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_Volume": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.Volume",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "source": {
                        "$ref": "#/definitions/kubernetes_base_VolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.base.VolumeSource"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_VolumeMount": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.VolumeMount",
                "properties": {
                    "mountPath": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "readOnly": {
                        "type": "boolean"
                    }
                },
                "type": "object"
            },
            "kubernetes_base_VolumeSource": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.base.VolumeSource",
                "properties": {
                    "emptyDir": {
                        "$ref": "#/definitions/kubernetes_base_EmptyDir",
                        "javaType": "io.fabric8.kubernetes.api.model.base.EmptyDir"
                    },
                    "gitRepo": {
                        "$ref": "#/definitions/kubernetes_base_GitRepo",
                        "javaType": "io.fabric8.kubernetes.api.model.base.GitRepo"
                    },
                    "hostDir": {
                        "$ref": "#/definitions/kubernetes_base_HostDir",
                        "javaType": "io.fabric8.kubernetes.api.model.base.HostDir"
                    },
                    "persistentDisk": {
                        "$ref": "#/definitions/kubernetes_base_GCEPersistentDisk",
                        "javaType": "io.fabric8.kubernetes.api.model.base.GCEPersistentDisk"
                    }
                },
                "type": "object"
            },
            "kubernetes_errors_StatusError": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.errors.StatusError",
                "properties": {
                    "ErrStatus": {
                        "$ref": "#/definitions/kubernetes_base_Status",
                        "javaType": "io.fabric8.kubernetes.api.model.base.Status"
                    }
                },
                "type": "object"
            },
            "kubernetes_resource_Quantity": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.resource.Quantity",
                "properties": {
                    "Amount": {
                        "$ref": "#/definitions/speter_inf_Dec",
                        "javaType": "io.fabric8.openshift.client.util.Dec"
                    },
                    "Format": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_runtime_RawExtension": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.runtime.RawExtension",
                "properties": {
                    "RawJSON": {
                        "items": {
                            "type": "integer"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "kubernetes_util_IntOrString": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString",
                "properties": {
                    "IntVal": {
                        "type": "integer"
                    },
                    "Kind": {
                        "type": "integer"
                    },
                    "StrVal": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Container": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Container",
                "properties": {
                    "command": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "cpu": {
                        "type": "integer"
                    },
                    "env": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EnvVar"
                        },
                        "type": "array"
                    },
                    "image": {
                        "type": "string"
                    },
                    "imagePullPolicy": {
                        "type": "string"
                    },
                    "lifecycle": {
                        "$ref": "#/definitions/kubernetes_v1beta2_Lifecycle",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Lifecycle"
                    },
                    "livenessProbe": {
                        "$ref": "#/definitions/kubernetes_v1beta2_LivenessProbe",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.LivenessProbe"
                    },
                    "memory": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "string"
                    },
                    "ports": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Port",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Port"
                        },
                        "type": "array"
                    },
                    "privileged": {
                        "type": "boolean"
                    },
                    "terminationMessagePath": {
                        "type": "string"
                    },
                    "volumeMounts": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_VolumeMount",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.VolumeMount"
                        },
                        "type": "array"
                    },
                    "workingDir": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerManifest": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerManifest",
                "properties": {
                    "containers": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Container",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Container"
                        },
                        "type": "array"
                    },
                    "dnsPolicy": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "restartPolicy": {
                        "$ref": "#/definitions/kubernetes_v1beta2_RestartPolicy",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicy"
                    },
                    "uuid": {
                        "type": "string"
                    },
                    "version": {
                        "type": "string"
                    },
                    "volumes": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Volume",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Volume"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerState": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerState",
                "properties": {
                    "running": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ContainerStateRunning",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateRunning"
                    },
                    "termination": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ContainerStateTerminated",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateTerminated"
                    },
                    "waiting": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ContainerStateWaiting",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateWaiting"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerStateRunning": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateRunning",
                "properties": {
                    "startedAt": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerStateTerminated": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateTerminated",
                "properties": {
                    "exitCode": {
                        "type": "integer"
                    },
                    "finishedAt": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "reason": {
                        "type": "string"
                    },
                    "signal": {
                        "type": "integer"
                    },
                    "startedAt": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerStateWaiting": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStateWaiting",
                "properties": {
                    "reason": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ContainerStatus": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStatus",
                "properties": {
                    "containerID": {
                        "type": "string"
                    },
                    "image": {
                        "type": "string"
                    },
                    "podIP": {
                        "type": "string"
                    },
                    "restartCount": {
                        "type": "integer"
                    },
                    "state": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ContainerState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerState"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_EmptyDir": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EmptyDir",
                "type": "object"
            },
            "kubernetes_v1beta2_Endpoints": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Endpoints",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "endpoints": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_EndpointsList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EndpointsList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Endpoints",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Endpoints"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_EnvVar": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EnvVar",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ExecAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ExecAction",
                "properties": {
                    "command": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_GCEPersistentDisk": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.GCEPersistentDisk",
                "properties": {
                    "fsType": {
                        "type": "string"
                    },
                    "partition": {
                        "type": "integer"
                    },
                    "pdName": {
                        "type": "string"
                    },
                    "readOnly": {
                        "type": "boolean"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_GitRepo": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.GitRepo",
                "properties": {
                    "repository": {
                        "type": "string"
                    },
                    "revision": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_HTTPGetAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.HTTPGetAction",
                "properties": {
                    "host": {
                        "type": "string"
                    },
                    "path": {
                        "type": "string"
                    },
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Handler": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Handler",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_v1beta2_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.HTTPGetAction"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_HostDir": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.HostDir",
                "properties": {
                    "path": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Lifecycle": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Lifecycle",
                "properties": {
                    "postStart": {
                        "$ref": "#/definitions/kubernetes_v1beta2_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Handler"
                    },
                    "preStop": {
                        "$ref": "#/definitions/kubernetes_v1beta2_Handler",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Handler"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_List": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.KubernetesList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_runtime_RawExtension",
                            "javaType": "io.fabric8.kubernetes.api.model.runtime.RawExtension"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_LivenessProbe": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.LivenessProbe",
                "properties": {
                    "exec": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ExecAction",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ExecAction"
                    },
                    "httpGet": {
                        "$ref": "#/definitions/kubernetes_v1beta2_HTTPGetAction",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.HTTPGetAction"
                    },
                    "initialDelaySeconds": {
                        "type": "integer"
                    },
                    "tcpSocket": {
                        "$ref": "#/definitions/kubernetes_v1beta2_TCPSocketAction",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.TCPSocketAction"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Minion": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Minion",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "hostIP": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "resources": {
                        "$ref": "#/definitions/kubernetes_v1beta2_NodeResources",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeResources"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "status": {
                        "$ref": "#/definitions/kubernetes_v1beta2_NodeStatus",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeStatus"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_MinionList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.MinionList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Minion",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Minion"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_NodeCondition": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeCondition",
                "properties": {
                    "kind": {
                        "type": "string"
                    },
                    "lastTransitionTime": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "reason": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_NodeResources": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeResources",
                "properties": {
                    "capacity": {
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_util_IntOrString",
                            "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                        },
                        "javaType": "java.util.Map<String,io.fabric8.kubernetes.api.model.util.IntOrString>",
                        "type": "object"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_NodeStatus": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeStatus",
                "properties": {
                    "conditions": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_NodeCondition",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.NodeCondition"
                        },
                        "type": "array"
                    },
                    "phase": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Pod": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Pod",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "currentState": {
                        "$ref": "#/definitions/kubernetes_v1beta2_PodState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodState"
                    },
                    "desiredState": {
                        "$ref": "#/definitions/kubernetes_v1beta2_PodState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodState"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "nodeSelector": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_PodList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Pod",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Pod"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_PodState": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodState",
                "properties": {
                    "host": {
                        "type": "string"
                    },
                    "hostIP": {
                        "type": "string"
                    },
                    "info": {
                        "additionalProperties": {
                            "$ref": "#/definitions/kubernetes_v1beta2_ContainerStatus",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStatus"
                        },
                        "javaType": "java.util.Map<String,io.fabric8.kubernetes.api.model.v1beta2.ContainerStatus>",
                        "type": "object"
                    },
                    "manifest": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ContainerManifest",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerManifest"
                    },
                    "message": {
                        "type": "string"
                    },
                    "podIP": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_PodTemplate": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodTemplate",
                "properties": {
                    "desiredState": {
                        "$ref": "#/definitions/kubernetes_v1beta2_PodState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodState"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Port": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Port",
                "properties": {
                    "containerPort": {
                        "type": "integer"
                    },
                    "hostIP": {
                        "type": "string"
                    },
                    "hostPort": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "string"
                    },
                    "protocol": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ReplicationController": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationController",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "currentState": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ReplicationControllerState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationControllerState"
                    },
                    "desiredState": {
                        "$ref": "#/definitions/kubernetes_v1beta2_ReplicationControllerState",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationControllerState"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ReplicationControllerList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationControllerList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_ReplicationController",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationController"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ReplicationControllerState": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationControllerState",
                "properties": {
                    "podTemplate": {
                        "$ref": "#/definitions/kubernetes_v1beta2_PodTemplate",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodTemplate"
                    },
                    "replicaSelector": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "replicas": {
                        "type": "integer"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_RestartPolicy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicy",
                "properties": {
                    "always": {
                        "$ref": "#/definitions/kubernetes_v1beta2_RestartPolicyAlways",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyAlways"
                    },
                    "never": {
                        "$ref": "#/definitions/kubernetes_v1beta2_RestartPolicyNever",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyNever"
                    },
                    "onFailure": {
                        "$ref": "#/definitions/kubernetes_v1beta2_RestartPolicyOnFailure",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyOnFailure"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_RestartPolicyAlways": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyAlways",
                "type": "object"
            },
            "kubernetes_v1beta2_RestartPolicyNever": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyNever",
                "type": "object"
            },
            "kubernetes_v1beta2_RestartPolicyOnFailure": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.RestartPolicyOnFailure",
                "type": "object"
            },
            "kubernetes_v1beta2_Service": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Service",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "containerPort": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                    },
                    "createExternalLoadBalancer": {
                        "type": "boolean"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "port": {
                        "type": "integer"
                    },
                    "portalIP": {
                        "type": "string"
                    },
                    "protocol": {
                        "type": "string"
                    },
                    "proxyPort": {
                        "type": "integer"
                    },
                    "publicIPs": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selector": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "sessionAffinity": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_ServiceList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ServiceList",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_v1beta2_Service",
                            "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Service"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_TCPSocketAction": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.TCPSocketAction",
                "properties": {
                    "port": {
                        "$ref": "#/definitions/kubernetes_util_IntOrString",
                        "javaType": "io.fabric8.kubernetes.api.model.util.IntOrString"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_TypeMeta": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.TypeMeta",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "integer"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_Volume": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Volume",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "source": {
                        "$ref": "#/definitions/kubernetes_v1beta2_VolumeSource",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.VolumeSource"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_VolumeMount": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.VolumeMount",
                "properties": {
                    "mountPath": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "readOnly": {
                        "type": "boolean"
                    }
                },
                "type": "object"
            },
            "kubernetes_v1beta2_VolumeSource": {
                "additionalProperties": true,
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.VolumeSource",
                "properties": {
                    "emptyDir": {
                        "$ref": "#/definitions/kubernetes_v1beta2_EmptyDir",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EmptyDir"
                    },
                    "gitRepo": {
                        "$ref": "#/definitions/kubernetes_v1beta2_GitRepo",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.GitRepo"
                    },
                    "hostDir": {
                        "$ref": "#/definitions/kubernetes_v1beta2_HostDir",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.HostDir"
                    },
                    "persistentDisk": {
                        "$ref": "#/definitions/kubernetes_v1beta2_GCEPersistentDisk",
                        "javaType": "io.fabric8.kubernetes.api.model.v1beta2.GCEPersistentDisk"
                    }
                },
                "type": "object"
            },
            "os_build_Build": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.Build",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "cancelled": {
                        "type": "boolean"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "parameters": {
                        "$ref": "#/definitions/os_build_BuildParameters",
                        "javaType": "io.fabric8.openshift.api.model.build.BuildParameters"
                    },
                    "podName": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildConfig": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildConfig",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "parameters": {
                        "$ref": "#/definitions/os_build_BuildParameters",
                        "javaType": "io.fabric8.openshift.api.model.build.BuildParameters"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "triggers": {
                        "items": {
                            "$ref": "#/definitions/os_build_BuildTriggerPolicy",
                            "javaType": "io.fabric8.openshift.api.model.build.BuildTriggerPolicy"
                        },
                        "type": "array"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildConfigList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildConfigList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_build_BuildConfig",
                            "javaType": "io.fabric8.openshift.api.model.build.BuildConfig"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_build_Build",
                            "javaType": "io.fabric8.openshift.api.model.build.Build"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildOutput": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildOutput",
                "properties": {
                    "imageTag": {
                        "type": "string"
                    },
                    "registry": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildParameters": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildParameters",
                "properties": {
                    "output": {
                        "$ref": "#/definitions/os_build_BuildOutput",
                        "javaType": "io.fabric8.openshift.api.model.build.BuildOutput"
                    },
                    "revision": {
                        "$ref": "#/definitions/os_build_SourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.build.SourceRevision"
                    },
                    "source": {
                        "$ref": "#/definitions/os_build_BuildSource",
                        "javaType": "io.fabric8.openshift.api.model.build.BuildSource"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_build_BuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.build.BuildStrategy"
                    }
                },
                "type": "object"
            },
            "os_build_BuildSource": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildSource",
                "properties": {
                    "git": {
                        "$ref": "#/definitions/os_build_GitBuildSource",
                        "javaType": "io.fabric8.openshift.api.model.build.GitBuildSource"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildStrategy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildStrategy",
                "properties": {
                    "customStrategy": {
                        "$ref": "#/definitions/os_build_CustomBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.build.CustomBuildStrategy"
                    },
                    "dockerStrategy": {
                        "$ref": "#/definitions/os_build_DockerBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.build.DockerBuildStrategy"
                    },
                    "stiStrategy": {
                        "$ref": "#/definitions/os_build_STIBuildStrategy",
                        "javaType": "io.fabric8.openshift.api.model.build.STIBuildStrategy"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_BuildTriggerPolicy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.BuildTriggerPolicy",
                "properties": {
                    "generic": {
                        "$ref": "#/definitions/os_build_WebHookTrigger",
                        "javaType": "io.fabric8.openshift.api.model.build.WebHookTrigger"
                    },
                    "github": {
                        "$ref": "#/definitions/os_build_WebHookTrigger",
                        "javaType": "io.fabric8.openshift.api.model.build.WebHookTrigger"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_CustomBuildStrategy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.CustomBuildStrategy",
                "properties": {
                    "env": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.base.EnvVar"
                        },
                        "type": "array"
                    },
                    "exposeDockerSocket": {
                        "type": "boolean"
                    },
                    "image": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_DockerBuildStrategy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.DockerBuildStrategy",
                "properties": {
                    "contextDir": {
                        "type": "string"
                    },
                    "noCache": {
                        "type": "boolean"
                    }
                },
                "type": "object"
            },
            "os_build_GitBuildSource": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.GitBuildSource",
                "properties": {
                    "ref": {
                        "type": "string"
                    },
                    "uri": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_GitSourceRevision": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.GitSourceRevision",
                "properties": {
                    "author": {
                        "$ref": "#/definitions/os_build_SourceControlUser",
                        "javaType": "io.fabric8.openshift.api.model.build.SourceControlUser"
                    },
                    "commit": {
                        "type": "string"
                    },
                    "committer": {
                        "$ref": "#/definitions/os_build_SourceControlUser",
                        "javaType": "io.fabric8.openshift.api.model.build.SourceControlUser"
                    },
                    "message": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_STIBuildStrategy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.STIBuildStrategy",
                "properties": {
                    "clean": {
                        "type": "boolean"
                    },
                    "image": {
                        "type": "string"
                    },
                    "scripts": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_SourceControlUser": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.SourceControlUser",
                "properties": {
                    "email": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_SourceRevision": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.SourceRevision",
                "properties": {
                    "git": {
                        "$ref": "#/definitions/os_build_GitSourceRevision",
                        "javaType": "io.fabric8.openshift.api.model.build.GitSourceRevision"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_build_WebHookTrigger": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.build.WebHookTrigger",
                "properties": {
                    "secret": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_config_Config": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.config.Config",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {},
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_CustomDeploymentStrategyParams": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.CustomDeploymentStrategyParams",
                "properties": {
                    "command": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "environment": {
                        "items": {
                            "$ref": "#/definitions/kubernetes_base_EnvVar",
                            "javaType": "io.fabric8.kubernetes.api.model.base.EnvVar"
                        },
                        "type": "array"
                    },
                    "image": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_Deployment": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.Deployment",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "controllerTemplate": {
                        "$ref": "#/definitions/kubernetes_base_ReplicationControllerSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.base.ReplicationControllerSpec"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "details": {
                        "$ref": "#/definitions/os_deploy_DeploymentDetails",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentDetails"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_deploy_DeploymentStrategy",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentStrategy"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentCause": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentCause",
                "properties": {
                    "imageTrigger": {
                        "$ref": "#/definitions/os_deploy_DeploymentCauseImageTrigger",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentCauseImageTrigger"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentCauseImageTrigger": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentCauseImageTrigger",
                "properties": {
                    "repositoryName": {
                        "type": "string"
                    },
                    "tag": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentConfig": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentConfig",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "details": {
                        "$ref": "#/definitions/os_deploy_DeploymentDetails",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentDetails"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "latestVersion": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "template": {
                        "$ref": "#/definitions/os_deploy_DeploymentTemplate",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTemplate"
                    },
                    "triggers": {
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentTriggerPolicy",
                            "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTriggerPolicy"
                        },
                        "type": "array"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentConfigList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentConfigList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentConfig",
                            "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentConfig"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentDetails": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentDetails",
                "properties": {
                    "causes": {
                        "items": {
                            "$ref": "#/definitions/os_deploy_DeploymentCause",
                            "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentCause"
                        },
                        "type": "array"
                    },
                    "message": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_deploy_Deployment",
                            "javaType": "io.fabric8.openshift.api.model.deploy.Deployment"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentStrategy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentStrategy",
                "properties": {
                    "customParams": {
                        "$ref": "#/definitions/os_deploy_CustomDeploymentStrategyParams",
                        "javaType": "io.fabric8.openshift.api.model.deploy.CustomDeploymentStrategyParams"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentTemplate": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTemplate",
                "properties": {
                    "controllerTemplate": {
                        "$ref": "#/definitions/kubernetes_base_ReplicationControllerSpec",
                        "javaType": "io.fabric8.kubernetes.api.model.base.ReplicationControllerSpec"
                    },
                    "strategy": {
                        "$ref": "#/definitions/os_deploy_DeploymentStrategy",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentStrategy"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentTriggerImageChangeParams": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTriggerImageChangeParams",
                "properties": {
                    "automatic": {
                        "type": "boolean"
                    },
                    "containerNames": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "repositoryName": {
                        "type": "string"
                    },
                    "tag": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_deploy_DeploymentTriggerPolicy": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTriggerPolicy",
                "properties": {
                    "imageChangeParams": {
                        "$ref": "#/definitions/os_deploy_DeploymentTriggerImageChangeParams",
                        "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentTriggerImageChangeParams"
                    },
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_image_Image": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.image.Image",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "dockerImageMetadata": {
                        "$ref": "#/definitions/docker_Image",
                        "javaType": "io.fabric8.docker.client.dockerclient.Image"
                    },
                    "dockerImageReference": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_image_ImageList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.image.ImageList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_image_Image",
                            "javaType": "io.fabric8.openshift.api.model.image.Image"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_image_ImageRepository": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.image.ImageRepository",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "dockerImageRepository": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "status": {
                        "$ref": "#/definitions/os_image_ImageRepositoryStatus",
                        "javaType": "io.fabric8.openshift.api.model.image.ImageRepositoryStatus"
                    },
                    "tags": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_image_ImageRepositoryList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.image.ImageRepositoryList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_image_ImageRepository",
                            "javaType": "io.fabric8.openshift.api.model.image.ImageRepository"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_image_ImageRepositoryStatus": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.image.ImageRepositoryStatus",
                "properties": {
                    "dockerImageRepository": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_route_Route": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.route.Route",
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "host": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "path": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "serviceName": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_route_RouteList": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.route.RouteList",
                "properties": {
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "items": {
                        "items": {
                            "$ref": "#/definitions/os_route_Route",
                            "javaType": "io.fabric8.openshift.api.model.route.Route"
                        },
                        "type": "array"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_template_Parameter": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.template.Parameter",
                "properties": {
                    "Description": {
                        "type": "string"
                    },
                    "From": {
                        "type": "string"
                    },
                    "Generate": {
                        "type": "string"
                    },
                    "Name": {
                        "type": "string"
                    },
                    "Value": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "os_template_Template": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.api.model.template.Template",
                "properties": {
                    "ObjectLabels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "Objects": {
                        "items": {},
                        "type": "array"
                    },
                    "Parameters": {
                        "items": {
                            "$ref": "#/definitions/os_template_Parameter",
                            "javaType": "io.fabric8.openshift.api.model.template.Parameter"
                        },
                        "type": "array"
                    },
                    "annotations": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "apiVersion": {
                        "default": "v1beta2",
                        "type": "string"
                    },
                    "creationTimestamp": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "labels": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "javaType": "java.util.Map<String,String>",
                        "type": "object"
                    },
                    "name": {
                        "type": "string"
                    },
                    "namespace": {
                        "type": "string"
                    },
                    "resourceVersion": {
                        "type": "string"
                    },
                    "selfLink": {
                        "type": "string"
                    },
                    "uid": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "speter_inf_Dec": {
                "additionalProperties": true,
                "javaType": "io.fabric8.openshift.client.util.Dec",
                "type": "object"
            }
        },
        "id": "http://fabric8.io/fabric8/v2/Schema#",
        "properties": {
            "BuildConfigList": {
                "$ref": "#/definitions/os_build_BuildConfigList",
                "javaType": "io.fabric8.openshift.api.model.build.BuildConfigList"
            },
            "BuildList": {
                "$ref": "#/definitions/os_build_BuildList",
                "javaType": "io.fabric8.openshift.api.model.build.BuildList"
            },
            "Config": {
                "$ref": "#/definitions/os_config_Config",
                "javaType": "io.fabric8.openshift.api.model.config.Config"
            },
            "ContainerStatus": {
                "$ref": "#/definitions/kubernetes_v1beta2_ContainerStatus",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ContainerStatus"
            },
            "DeploymentConfigList": {
                "$ref": "#/definitions/os_deploy_DeploymentConfigList",
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentConfigList"
            },
            "DeploymentList": {
                "$ref": "#/definitions/os_deploy_DeploymentList",
                "javaType": "io.fabric8.openshift.api.model.deploy.DeploymentList"
            },
            "Endpoints": {
                "$ref": "#/definitions/kubernetes_v1beta2_Endpoints",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Endpoints"
            },
            "EndpointsList": {
                "$ref": "#/definitions/kubernetes_v1beta2_EndpointsList",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EndpointsList"
            },
            "EnvVar": {
                "$ref": "#/definitions/kubernetes_v1beta2_EnvVar",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.EnvVar"
            },
            "ImageList": {
                "$ref": "#/definitions/os_image_ImageList",
                "javaType": "io.fabric8.openshift.api.model.image.ImageList"
            },
            "ImageRepositoryList": {
                "$ref": "#/definitions/os_image_ImageRepositoryList",
                "javaType": "io.fabric8.openshift.api.model.image.ImageRepositoryList"
            },
            "KubernetesList": {
                "$ref": "#/definitions/kubernetes_v1beta2_List",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.KubernetesList"
            },
            "Minion": {
                "$ref": "#/definitions/kubernetes_v1beta2_Minion",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.Minion"
            },
            "MinionList": {
                "$ref": "#/definitions/kubernetes_v1beta2_MinionList",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.MinionList"
            },
            "PodList": {
                "$ref": "#/definitions/kubernetes_v1beta2_PodList",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.PodList"
            },
            "ReplicationControllerList": {
                "$ref": "#/definitions/kubernetes_v1beta2_ReplicationControllerList",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ReplicationControllerList"
            },
            "RouteList": {
                "$ref": "#/definitions/os_route_RouteList",
                "javaType": "io.fabric8.openshift.api.model.route.RouteList"
            },
            "ServiceList": {
                "$ref": "#/definitions/kubernetes_v1beta2_ServiceList",
                "javaType": "io.fabric8.kubernetes.api.model.v1beta2.ServiceList"
            },
            "StatusError": {
                "$ref": "#/definitions/kubernetes_errors_StatusError",
                "javaType": "io.fabric8.kubernetes.api.model.errors.StatusError"
            },
            "Template": {
                "$ref": "#/definitions/os_template_Template",
                "javaType": "io.fabric8.openshift.api.model.template.Template"
            }
        },
        "type": "object"
    };
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="schema.ts"/>
var Forms2Tests;
(function (Forms2Tests) {
    var pluginName = 'hawtio-forms2-tests';
    var log = Logger.get(pluginName);
    var tp = 'test-plugins/form2-examples/html';
    Forms2Tests._module = angular.module(pluginName, []);
    var welcomeTab = null;
    var tab2 = null;
    Forms2Tests._module.config(['$routeProvider', 'HawtioNavBuilderProvider', function ($routeProvider, builder) {
            welcomeTab = builder.create()
                .id('welcome')
                .rank(10)
                .title(function () { return "Documentation"; })
                .href(function () { return "/docs"; })
                .subPath("Welcome", "welcome", builder.join(tp, "welcome.html"), 1)
                .build();
            tab2 = builder.create()
                .id(pluginName + '-form2')
                .rank(2)
                .title(function () { return "Forms2"; })
                .href(function () { return "/forms2"; })
                .subPath("Selector Example", "selector_example", builder.join(tp, "selectorExample.html"), 9)
                .subPath("Simple Example", 'simple_example', builder.join(tp, "simpleExample.html"), 10)
                .subPath("Array Example", 'array_example', builder.join(tp, "arrayExample.html"), 8)
                .subPath("Typeahead Example", 'typeahead_example', builder.join(tp, "typeaheadExample.html"), 8)
                .subPath("Kitchen Sink", "simple_form", builder.join(tp, "simpleForm2.html"), 0)
                .subPath("Map", "map", builder.join(tp, "map.html"), 8)
                .subPath("Tabbed Form", "tabbed_form", builder.join(tp, "tabbedForm2.html"), 8)
                .subPath("Wizard Form", "wizard_form", builder.join(tp, "wizardForm2.html"), 7)
                .subPath("Nested Form", "nested_form", builder.join(tp, "nestedForm2.html"), 6)
                .subPath("Schema Test", "from_schema", builder.join(tp, "fromSchema.html"), 3)
                .build();
            builder.configureRouting($routeProvider, welcomeTab);
            builder.configureRouting($routeProvider, tab2);
        }]);
    Forms2Tests._module.run(["HawtioNav", "SchemaRegistry", function (nav, schemas) {
            nav.add(welcomeTab);
            nav.add(tab2);
            nav.add({
                id: 'project-link',
                isSelected: function () { return false; },
                title: function () { return 'github'; },
                attributes: {
                    class: 'pull-right'
                },
                linkAttributes: {
                    target: '_blank'
                },
                href: function () { return 'https://github.com/hawtio/hawtio-forms'; }
            });
            nav.add({
                id: 'hawtio-link',
                isSelected: function () { return false; },
                title: function () { return 'hawtio'; },
                attributes: {
                    class: 'pull-right'
                },
                linkAttributes: {
                    target: '_blank'
                },
                href: function () { return 'http://hawt.io'; }
            });
            schemas.addSchema('kubernetes', Kubernetes.schema);
            schemas.addSchema('testObject', {
                "description": "Object from registry",
                properties: {
                    "Attr1": {
                        "type": "number",
                        "label": "Attribute 1"
                    }
                }
            });
            schemas.addSchema('ArrayObject', {
                description: 'Some object with a username and password',
                javaType: 'com.foo.ArrayObject',
                properties: {
                    "Field1": {
                        "type": "string",
                        "label": "Username",
                        "input-attributes": {
                            placeholder: "Username..."
                        }
                    },
                    "Field2": {
                        "type": "password",
                        "label": "Password",
                        "input-attributes": {
                            placeholder: "Password..."
                        }
                    },
                    "Field3": {
                        "type": "string",
                        "label": "Type",
                        "enum": {
                            "label1": "value1",
                            "label2": "value2",
                            "label3": "value3"
                        }
                    }
                }
            });
            schemas.addSchema('StringArray', {
                description: 'Array of strings',
                properties: {
                    values: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            });
            schemas.addSchema('ObjectWithArrayObject', {
                desription: 'Some object with an embedded object',
                javaType: 'com.foo.ObjectWithArrayObject',
                properties: {
                    arg1: {
                        type: 'string'
                    },
                    arg2: {
                        type: 'ArrayObject'
                    }
                }
            });
        }]);
    var baseConfig = {
        "id": 'myForm',
        "style": HawtioForms.FormStyle.HORIZONTAL,
        "mode": HawtioForms.FormMode.EDIT,
        "disableHumanizeLabel": false,
        hideLegend: false,
        "properties": {
            "booleanThing": {
                "type": "boolean",
                "default": "true"
            },
            "fromSchemaRegistry": {
                "type": "testObject"
            },
            "SelectWithConfig": {
                type: 'text',
                enum: [{
                        value: 'A Value 1',
                        label: 'A Label 1',
                        attributes: {
                            title: 'A title 1'
                        }
                    }, {
                        value: 'A Value 2',
                        label: 'A Label 2',
                        attributes: {
                            title: 'A title 2'
                        }
                    }, {
                        value: 'A Value 3',
                        label: 'A Label 3',
                        attributes: {
                            title: 'A title 3'
                        }
                    }, {
                        value: 'A Value 4',
                        label: 'A Label 4',
                        attributes: {
                            title: 'A title 4'
                        }
                    }]
            },
            "LongObjectSelect": {
                type: "java.lang.String",
                enum: {
                    "label1": "value1",
                    "label2": "value2",
                    "label3": "value3",
                    "label4": "value4",
                    "label5": "value5",
                    "label6": "value6",
                    "label7": "value7",
                    "label8": "value8"
                },
                default: "value3"
            },
            "key": {
                "label": "The Argument",
                "type": "java.lang.String",
                "description": "Enter the argument key",
                "input-attributes": {
                    "value": "This is an initial value",
                    "placeholder": "Enter in some value"
                },
                "control-group-attributes": {
                    "ng-show": "entity.booleanArg == true"
                }
            },
            "InputWithTypeahead": {
                type: 'text',
                typeaheadData: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
                'input-attributes': {
                    'typeahead': 'number for number in config.properties.InputWithTypeahead.typeaheadData'
                }
            },
            "RequiredThing": {
                type: 'text',
                'input-attributes': {
                    'required': 'true'
                }
            },
            array1: {
                items: {
                    type: 'string'
                },
                type: 'array'
            },
            array2: {
                items: {
                    type: 'number'
                },
                type: 'array'
            },
            array3: {
                items: {
                    type: 'ArrayObject'
                },
                type: 'array'
            },
            scheme: {
                type: "java.lang.String",
                tooltip: "HTTP or HTTPS",
                enum: ["http", "https"],
                default: "http",
            },
            nestedObject: {
                style: HawtioForms.FormStyle.HORIZONTAL,
                label: "A Nested Object",
                type: 'object',
                properties: {
                    'Attribute1': {
                        type: 'text',
                        'label-attributes': {
                            'style': 'color: green'
                        }
                    },
                    'Attribute2': {
                        type: 'java.lang.Integer',
                        label: 'A Number'
                    }
                }
            },
            "ObjectSelect": {
                type: "java.lang.String",
                enum: {
                    "label1": "value1",
                    "label2": "value2",
                    "label3": "value3"
                },
                default: "value3"
            },
            "value": {
                "description": "Enter the argument value",
                "label": "The Value",
                "type": "java.lang.String",
                "tooltip": "This is the tooltip",
                "input-attributes": {
                    "placeholder": "Hello World!",
                    "value": "This is also an initial value"
                }
            },
            "staticText": {
                "type": "static",
                "description": "This is some static text, use this type to add a description in your form that's properly formatted"
            },
            "templatedThing": {
                "formTemplate": "<p class=\"alert alert-info\">Hi, I'm a custom template and I like warm {{entity.templatedThing}}</p>",
                "default": "hugs!"
            },
            "passwordField": {
                "type": "password",
                "input-attributes": {
                    placeholder: "Password..."
                }
            },
            "longArg": {
                "description": "Long argument",
                "type": "Long",
                "label-attributes": {
                    "style": "color: red"
                },
                "input-attributes": {
                    "min": "5",
                    "max": "10"
                }
            },
            "intArg": {
                "description": "Int argument",
                "type": "Integer",
                "hidden": true,
                "input-attributes": {
                    "value": 5
                }
            },
            "booleanArg": {
                "description": "Toggles whether or not you want to enter the argument key",
                "type": "java.lang.Boolean"
            }
        },
        "description": "This is my awesome form",
        "type": "java.lang.String"
    };
    var baseModel = {
        "scheme": "http",
        "array1": ["foo", "bar", "cheese"],
        "array2": [
            20,
            13
        ],
        "array3": [
            {
                "Field1": "test1",
                "Field2": "test1",
                "Field3": "value2"
            },
            {
                "Field1": "test2",
                "Field2": "test2",
                "Field3": "value3"
            },
            {
                "Field1": "test3",
                "Field2": "test3",
                "Field3": "value1"
            }
        ]
    };
    Forms2Tests._module.controller("WelcomePageController", ["$scope", "marked", "$http", "$timeout", function ($scope, marked, $http, $timeout) {
            $timeout(function () {
                $http.get('README.md').success(function (data) {
                    log.debug("Fetched README.md, data: ", data);
                    $scope.readme = marked(data);
                }).error(function (data) {
                    log.debug("Failed to fetch README.md: ", data);
                });
            }, 500);
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2SchemaController", ["$scope", "$templateCache", "SchemaRegistry", function ($scope, $templateCache, schemas) {
            $scope.config = schemas.cloneSchema("os_build_BuildConfig");
            $scope.config.style = HawtioForms.FormStyle.STANDARD;
            $scope.config.mode = HawtioForms.FormMode.EDIT;
            $scope.model = {};
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2WizardController", ["$scope", "$templateCache", function ($scope, $templateCache) {
            var config = _.clone(baseConfig, true);
            config.wizard = {
                onChange: function (current, next, pageIds) {
                    log.debug("page changed, current page: ", current, " next: ", next);
                    // can manipulate what page the wizard goes to
                    /*
                    if (next < current) {
                      return current;
                    }
                    return next;
                    */
                },
                onFinish: function () {
                    log.debug("On finish clicked, model: ", $scope.model);
                    Core.notification('success', 'Finished!');
                },
                pages: {
                    "Welcome to my awesome wizard!": {
                        controls: ["RequiredThing", "array1", "booleanArg", "key"]
                    },
                    "Fill in these cool form controls...": {
                        controls: ["scheme", "nestedObject"]
                    },
                    "And these too, because forms are great!": {
                        controls: ["fromSchemaRegistry", "array3"]
                    },
                    "If you're happy with what you've entered, click finish!": {
                        controls: ['*']
                    }
                }
            };
            $scope.config = config;
            var model = _.clone(baseModel, true);
            $scope.model = model;
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2NestedController", ["$scope", "$templateCache", function ($scope, $templateCache) {
            var config = {
                properties: {
                    array3: {
                        items: {
                            type: 'ArrayObject'
                        },
                        type: 'array'
                    },
                    collection: {
                        type: 'array',
                        items: {
                            type: 'ObjectWithArrayObject'
                        }
                    }
                }
            };
            $scope.config = config;
            var model = {
                "collection": [
                    {
                        "arg2": {
                            "Field1": "one",
                            "Field2": "two",
                            "Field3": "value2"
                        },
                        "arg1": "An argument!"
                    },
                    {
                        arg1: 'Another thing!',
                        arg2: {
                            "Field1": "three",
                            "Field2": "four",
                            "Field3": "value1"
                        }
                    }
                ],
                "array3": [
                    {
                        "Field1": "test1",
                        "Field2": "test1",
                        "Field3": "value2"
                    },
                    {
                        "Field1": "test2",
                        "Field2": "test2",
                        "Field3": "value3"
                    },
                    {
                        "Field1": "test3",
                        "Field2": "test3",
                        "Field3": "value1"
                    }
                ]
            };
            $scope.model = model;
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2MapController", ["$scope", "$templateCache", "SchemaRegistry", function ($scope, $templateCache, schemas) {
            /*
            schemas.addListener('mapControllerListener', function (name, schema) {
                _.forIn(schema.properties, function (property, id) {
                  if (property.type === 'map') {
                    log.debug("Property: ", id, " is a map, key type: ", property.items.key, " value type: ", property.items.value);
                  }
                });
              });
              */
            var config = {
                label: 'Various Maps',
                properties: {
                    simpleMap: {
                        type: 'map',
                        items: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'string'
                            }
                        }
                    },
                    mapWithObject: {
                        type: 'map',
                        items: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'ArrayObject'
                            }
                        }
                    },
                    mapWithArrayObject: {
                        type: 'map',
                        items: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'StringArray'
                            }
                        }
                    },
                    mapWithArray: {
                        type: 'map',
                        items: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            }
                        }
                    },
                    mapWithArrayOfObject: {
                        type: 'map',
                        items: {
                            key: {
                                type: 'string'
                            },
                            value: {
                                type: 'array',
                                items: {
                                    type: 'ArrayObject'
                                }
                            }
                        }
                    }
                }
            };
            var model = {
                simpleMap: {
                    'foo': 'bar',
                    'one': 'two',
                    'three': 'four'
                },
                mapWithObject: {
                    'One': {
                        "Field1": "test1",
                        "Field2": "test1",
                        "Field3": "value2"
                    },
                    Two: {
                        "Field1": "test2",
                        "Field2": "test2",
                        "Field3": "value3"
                    },
                    Three: {
                        "Field1": "test3",
                        "Field2": "test3",
                        "Field3": "value1"
                    }
                },
                mapWithArrayObject: {
                    one: {
                        values: ['one', 'two', 'three']
                    },
                    two: {
                        values: ['one', 'two', 'three']
                    }
                },
                mapWithArray: {
                    one: ['one', 'two', 'three'],
                    two: ['one', 'three', 'two']
                },
                mapWithArrayOfObject: {
                    one: [
                        {
                            "Field1": "test1",
                            "Field2": "test1",
                            "Field3": "value2"
                        },
                        {
                            "Field1": "test2",
                            "Field2": "test2",
                            "Field3": "value3"
                        },
                        {
                            "Field1": "test3",
                            "Field2": "test3",
                            "Field3": "value1"
                        }
                    ],
                    two: [
                        {
                            "Field1": "test1",
                            "Field2": "test1",
                            "Field3": "value2"
                        },
                        {
                            "Field1": "test2",
                            "Field2": "test2",
                            "Field3": "value3"
                        },
                        {
                            "Field1": "test3",
                            "Field2": "test3",
                            "Field3": "value1"
                        }
                    ]
                }
            };
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2TabsController", ["$scope", "$templateCache", function ($scope, $templateCache) {
            var config = _.clone(baseConfig, true);
            config.tabs = {
                "Tab One": ["scheme", "array3", "key", "value"],
                "Tab Two": ["*"],
                "Tab Three": ["booleanArg"]
            };
            var model = _.clone(baseModel, true);
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    Forms2Tests._module.controller("HawtioFormsTests.Forms2Controller", ["$scope", "$templateCache", "SchemaRegistry", function ($scope, $templateCache, schemas) {
            var config = _.clone(baseConfig, true);
            config.controls = ["scheme", "nestedObject", "fromSchemaRegistry", "*", "array2", "array1"];
            $scope.config = config;
            var model = _.clone(baseModel, true);
            $scope.model = model;
            $scope.configStr = angular.toJson($scope.config, true);
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
    hawtioPluginLoader.addModule(pluginName);
})(Forms2Tests || (Forms2Tests = {}));

/// <reference path="form2Plugin.ts"/>
var Forms2Tests;
(function (Forms2Tests) {
    var log = Logger.get('forms2-array-example');
    Forms2Tests._module.controller("Forms2Tests.ArrayExample", ["$scope", "$templateCache", 'SchemaRegistry', function ($scope, $templateCache, SchemaRegistry) {
            var configStr = "\n    var config = {\n      properties: {\n        // A simple array of string values\n        \"Strings\": {\n          type: \"array\",\n          items: {\n            type: 'string'\n          }\n        },\n        // An array of object values of type \"MyThing\", defined below\n        \"Objects\": {\n          type: \"array\",\n          items: {\n            type: 'MyThing'\n          }\n        }\n      }\n    };\n\n    // We use a separate FormConfig for complex array items\n    var elementConfig = {\n      properties: {\n        \"FirstValue\": {\n          type: 'string',\n        },\n        \"SecondValue\": {\n          type: 'number',\n          default: 1,\n          'input-attributes': {\n            'max': 10,\n            'min': 1\n          }\n        }\n      }\n    };\n    // add this to the schema registry, SchemaRegistry is an angular service, so can be injected anywhere, in your module's 'run' function, another service etc.\n    SchemaRegistry.addSchema(\"MyThing\", elementConfig);\n\n    // let's fill in the model so the form looks more interesting\n    var model = {\n      'Strings': ['foo', 'bar'],\n      'Objects': [{ FirstValue: 'one', SecondValue: 7 }]\n    }\n\n    ";
            var config = {
                properties: {
                    // A simple array of string values
                    "Strings": {
                        type: "array",
                        items: {
                            type: 'string'
                        }
                    },
                    // An array of object values of type "MyThing", defined below
                    "Objects": {
                        type: "array",
                        items: {
                            type: 'MyThing'
                        }
                    }
                }
            };
            // We use a separate FormConfig for complex array items
            var elementConfig = {
                properties: {
                    "FirstValue": {
                        type: 'string',
                    },
                    "SecondValue": {
                        type: 'number',
                        default: 1,
                        'input-attributes': {
                            'max': 10,
                            'min': 1
                        }
                    }
                }
            };
            // add this to the schema registry, SchemaRegistry is an angular service, so can be injected anywhere, in your module's 'run' function, another service etc.
            SchemaRegistry.addSchema("MyThing", elementConfig);
            // let's fill in the model so the form looks more interesting
            var model = {
                'Strings': ['foo', 'bar'],
                'Objects': [{ FirstValue: 'one', SecondValue: 7 }]
            };
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = configStr;
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
})(Forms2Tests || (Forms2Tests = {}));

/// <reference path="form2Plugin.ts"/>
var Forms2Tests;
(function (Forms2Tests) {
    var log = Logger.get('forms2-selector-example');
    Forms2Tests._module.controller("Forms2Tests.SelectorExample", ["$scope", "$templateCache", function ($scope, $templateCache) {
            var configStr = "\n    var config = {\n      properties: {\n        \"Amount\": {\n          type: \"string\",\n          default: 2,\n          enum: {\n            \"One\": 1,\n            \"Two\": 2,\n            \"Three\": 3,\n            \"Four\": 4,\n            \"Five\": 5,\n            \"Six\": 6\n          },\n          selectors: {\n            select: (select) => {\n              select.css({ background: 'lightblue' });\n            }\n          }\n        },\n        \"Name\": {\n          type: \"string\",\n          selectors: {\n            '.control-label': (label) => {\n              label.css({ 'font-weight': 'bold' });\n            },\n            'el': (group) => {\n              group.attr({'ng-show': 'entity.Amount == 2'});\n            }\n          }\n        }\n      }\n    };\n\n    ";
            var config = {
                properties: {
                    "Amount": {
                        type: "string",
                        default: 2,
                        enum: {
                            "One": 1,
                            "Two": 2,
                            "Three": 3,
                            "Four": 4,
                            "Five": 5,
                            "Six": 6
                        },
                        selectors: {
                            select: function (select) {
                                select.css({ background: 'lightblue' });
                            }
                        }
                    },
                    "Name": {
                        type: "string",
                        selectors: {
                            '.control-label': function (label) {
                                label.css({ 'font-weight': 'bold' });
                            },
                            'el': function (group) {
                                group.attr({ 'ng-show': 'entity.Amount == 2' });
                            }
                        }
                    }
                }
            };
            var model = {};
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = configStr;
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
})(Forms2Tests || (Forms2Tests = {}));

/// <reference path="form2Plugin.ts"/>
var Forms2Tests;
(function (Forms2Tests) {
    var log = Logger.get('forms2-simple-example');
    Forms2Tests._module.controller("Forms2Tests.SimpleExample", ["$scope", "$templateCache", function ($scope, $templateCache) {
            var configStr = "\n    var config = {\n      // Standard bootstrap form with the label and control stacked\n      style: HawtioForms.FormStyle.STANDARD,\n      // Controls are editable, can also set to 'VIEW' to just show values\n      mode: HawtioForms.FormMode.EDIT,\n      properties: {\n        \"Name\": {\n          type: \"string\",\n          // Most controls support setting arbitrary attributes via 'input-attributes'\n          'input-attributes': {\n            'placeholder': 'Enter some name'\n          }\n        },\n        \"Amount\": {\n          type: \"string\",\n          'default': 2,\n          // Add an object of name/value pairs to turn a field into a select box\n          enum: {\n            \"One\": 1,\n            \"Two\": 2,\n            \"Three\": 3,\n            \"Four\": 4,\n            \"Five\": 5,\n            \"Six\": 6\n          },\n          description: 'Pick some amount'\n        },\n        \"Number\": {\n          type: 'number',\n          'default': 5,\n          // it's also possible via 'input-attributes' to use html5 attributes like min/max\n          'input-attributes': {\n            'max': 10,\n            'min': 5\n          }\n\n        },\n        \"Maybe\": {\n          type: 'boolean',\n          // if you want to customize the label for a control, use 'label'\n          label: \"Maybe?\",\n          'default': true\n        }\n      }\n    };\n    ";
            var config = {
                // Standard bootstrap form with the label and control stacked
                style: HawtioForms.FormStyle.STANDARD,
                // Controls are editable, can also set to 'VIEW' to just show values
                mode: HawtioForms.FormMode.EDIT,
                properties: {
                    "Name": {
                        type: "string",
                        // Most controls support setting arbitrary attributes via 'input-attributes'
                        'input-attributes': {
                            'placeholder': 'Enter some name'
                        }
                    },
                    "Amount": {
                        type: "string",
                        'default': 2,
                        // Add an object of name/value pairs to turn a field into a select box
                        enum: {
                            "One": 1,
                            "Two": 2,
                            "Three": 3,
                            "Four": 4,
                            "Five": 5,
                            "Six": 6
                        },
                        description: 'Pick some amount'
                    },
                    "Number": {
                        type: 'number',
                        'default': 5,
                        // it's also possible via 'input-attributes' to use html5 attributes like min/max
                        'input-attributes': {
                            'max': 10,
                            'min': 5
                        }
                    },
                    "Maybe": {
                        type: 'boolean',
                        // if you want to customize the label for a control, use 'label'
                        label: "Maybe?",
                        'default': true
                    }
                }
            };
            var model = {};
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = configStr;
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
})(Forms2Tests || (Forms2Tests = {}));

/// <reference path="form2Plugin.ts"/>
var Forms2Tests;
(function (Forms2Tests) {
    var log = Logger.get('forms2-typeahead-example');
    Forms2Tests._module.controller("Forms2Tests.TypeaheadExample", ["$scope", "$templateCache", 'SchemaRegistry', '$q', '$timeout', function ($scope, $templateCache, SchemaRegistry, $q, $timeout) {
            var configStr = "\n    var config = {\n      properties: {\n        \"InputWithTypeahead\": {\n          type: \"string\",\n          getWords: () => {\n            return $q((resolve, reject) => {\n              setTimeout(() => {\n                resolve(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);\n              }, 10)\n            })\n          } ,\n          \"input-attributes\": {\n            \"typeahead\": \"word for word in config.properties.InputWithTypeahead.getWords()\"\n          }\n        },\n        \"InputWithInlineTypeahead\": {\n          \"type\": \"text\",\n          \"typeaheadData\": [\n            \"one\",\n            \"two\",\n            \"three\",\n            \"four\",\n            \"five\",\n            \"six\",\n            \"seven\",\n            \"eight\",\n            \"nine\",\n            \"ten\"\n          ],\n          \"input-attributes\": {\n            \"typeahead\": \"number for number in config.properties.InputWithInlineTypeahead.typeaheadData\"\n          }\n        },\n      }\n    };\n    ";
            var config = {
                properties: {
                    "InputWithTypeahead": {
                        type: "string",
                        getWords: function () {
                            return $q(function (resolve, reject) {
                                setTimeout(function () {
                                    resolve(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
                                }, 10);
                            });
                        },
                        "input-attributes": {
                            "typeahead": "word for word in config.properties.InputWithTypeahead.getWords()"
                        }
                    },
                    "InputWithInlineTypeahead": {
                        "type": "text",
                        "typeaheadData": [
                            "one",
                            "two",
                            "three",
                            "four",
                            "five",
                            "six",
                            "seven",
                            "eight",
                            "nine",
                            "ten"
                        ],
                        "input-attributes": {
                            "typeahead": "number for number in config.properties.InputWithInlineTypeahead.typeaheadData"
                        }
                    },
                }
            };
            var model = {};
            $scope.config = config;
            $scope.model = model;
            $scope.configStr = configStr;
            $scope.markup = $templateCache.get("markup.html");
            $scope.$watch('model', _.debounce(function () {
                $scope.modelStr = angular.toJson($scope.model, true);
                Core.$apply($scope);
            }, 500), true);
            $scope.$watch('configStr', _.debounce(function () {
                try {
                    $scope.config = angular.fromJson($scope.configStr);
                    log.debug("Updated config...");
                    Core.$apply($scope);
                }
                catch (e) {
                }
            }, 1000));
        }]);
})(Forms2Tests || (Forms2Tests = {}));

angular.module("hawtio-forms-test-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("test-plugins/form1-examples/html/test.html","<div ng-controller=\'Forms.FormTestController\'>\r\n\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h3>Basic form</h3>\r\n      <p>Here\'s a basic form generated from some JSON schema</p>\r\n      <p>Here\'s some example JSON schema definition</p>\r\n      <div hawtio-editor=\"basicFormEx1Schema\" mode=\"javascript\"></div>\r\n      <button class=\'btn\' ng-click=\"updateSchema()\"><i class=\"icon-save\"></i> Update form</button>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <p>You can define an entity object to have default values filled in</p>\r\n      <div hawtio-editor=\"basicFormEx1EntityString\" mode=\"javascript\"></div>\r\n      <button class=\'btn\' ng-click=\"updateEntity()\"><i class=\"icon-save\"></i> Update form</button>\r\n      <p>And here is the code for the form</p>\r\n      <div hawtio-editor=\"basicFormEx1\" mode=\"html\"></div>\r\n      <h3>The resulting form</h3>\r\n      <div class=\"directive-example\">\r\n        <div compile=\"basicFormEx1\"></div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <h3>Form related controls</h3>\r\n      <p>There\'s also directives to take care of resetting or submitting a form</p>\r\n      <p></p>\r\n      <p>Clearing a form is done using the hawtio-reset directive</p>\r\n      <div hawtio-editor=\"hawtioResetEx\" mode=\"html\"></div>\r\n      <p>Click the button below to clear the above form</p>\r\n      <div class=\"directive-example\">\r\n        <div compile=\"hawtioResetEx\"></div>\r\n      </div>\r\n      <p>And to submit a form use hawtio-submit</p>\r\n      <div hawtio-editor=\"hawtioSubmitEx\" mode=\"html\"></div>\r\n      <div class=\"directive-example\">\r\n        <div compile=\"hawtioSubmitEx\"></div>\r\n      </div>\r\n      <p>Fill in the form and click the submit button above to see what the form produces</p>\r\n      <div hawtio-editor=\"basicFormEx1Result\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <p></p>\r\n    </div>\r\n  </div>\r\n\r\n  <!--\r\n\r\n  <h3>Form Testing</h3>\r\n\r\n  <div>\r\n    <div class=\"control-group\">\r\n      <a class=\'btn\' ng-href=\"\" hawtio-submit=\'form-with-inline-arguments\'><i class=\"icon-save\"></i> Save</a>\r\n      <a class=\'btn\' ng-href=\"\" hawtio-reset=\'form-with-inline-arguments\'><i class=\"icon-refresh\"></i> Clear</a>\r\n    </div>\r\n    Form with inline arguments\r\n    <div simple-form name=\'form-with-inline-arguments\' action=\'#/forms/test\' method=\'post\' data=\'setVMOption\' entity=\'cheese\' onSubmit=\"derp()\"></div>\r\n  </div>\r\n\r\n  <hr>\r\n\r\n  <div>\r\n    Read Only Form with config object\r\n    <div class=\"row-fluid\">\r\n      <button class=\"btn\" ng-click=\"toggleEdit()\">Edit</button>\r\n    </div>\r\n    <div simple-form data=\'setVMOption\' entity=\'cheese\' mode=\'view\'></div>\r\n  </div>\r\n\r\n  <hr>\r\n\r\n  <div>\r\n    Form with config object\r\n    <div simple-form=\'config\'></div>\r\n  </div>\r\n\r\n  <hr>\r\n\r\n  <div>\r\n    form with inline json config\r\n    <div simple-form name=\'form-with-inline-json-config\' action=\'#/forms/test\' method=\'post\' showTypes=\'false\' json=\'\r\n    {\r\n      \"properties\": {\r\n        \"key\": { \"description\": \"Argument key\", \"type\": \"java.lang.String\" },\r\n        \"value\": { \"description\": \"Argument value\", \"type\": \"java.lang.String\" },\r\n        \"longArg\": { \"description\": \"Long argument\", \"type\": \"Long\" },\r\n        \"intArg\": { \"description\": \"Int argument\", \"type\": \"Integer\" }},\r\n       \"description\": \"Show some stuff in a form from JSON\",\r\n       \"type\": \"java.lang.String\"\r\n    }\'></div>\r\n  </div>\r\n\r\n  -->\r\n</div>\r\n");
$templateCache.put("test-plugins/form1-examples/html/testTable.html","<div ng-controller=\'Forms.FormTestController\'>\r\n\r\n  <h3>Input Table Testing</h3>\r\n\r\n  <div>\r\n    input table with config object\r\n    <div hawtio-input-table=\"inputTableConfig\" entity=\"inputTableData\" data=\"inputTableConfig\" property=\"rows\"></div>\r\n  </div>\r\n\r\n</div>\r\n");
$templateCache.put("test-plugins/form1-examples/html/wizard.html","\r\n<script type=\"text/ng-template\" id=\"wizardMarkup.html\">\r\n  <div hawtio-form data=\"wizardConfig\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.WizardController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-6\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"wizardConfigStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"wizardMarkup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-6\">\r\n      <h5>In Action</h5>\r\n      <div class=\"directive-example\">\r\n        <div compile=\"wizardMarkup\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/arrayExample.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"Forms2Tests.ArrayExample\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>Example Javascript</h5>\r\n      <p>With hawtio-forms2 it\'s easy to create a form for building up a list or array of values.  Just specify \'array\' as the type, then add an \'items\' attribute to the form element configuration, which designates what type should be used for array items.  For more complex array types use the SchemaRegistry service to add a schema, hawtio-forms2 will then look that up as it builds the form markup.</p>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/fromSchema.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2SchemaController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/map.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2MapController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/nestedForm2.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2NestedController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/selectorExample.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"Forms2Tests.SelectorExample\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>Config</h5>\r\n      <p>In this case we\'re passing a \'selectors\' property for the FormElement, hawtio-forms2 will do a jquery \'find\' on the control element for each selector instance and pass the result of \'find\' into the selector function provided here.  This will happen before interpolation and compilation of the entire form template, so it\'s possible to add Angular directives on the fly etc.  Use \'el\' to get the entire form-group for that element.  In this example, changing the \'select\' value to anything other than \'Two\' will hide the \'Name\' element.\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/simpleExample.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"Forms2Tests.SimpleExample\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>Example Javascript</h5>\r\n      <p>This is a fairly basic example form configuration showing a few features that make it easy to create a custom form with a simple javascript object.  It\'s possible to add extra attributes to an input, or a label or the entire control group via \'input-attributes\', \'label-attributes\' or \'control-attributes\'.  For even more control take a look at the \'Selector Example\' page.</p>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/simpleForm2.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2Controller\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/tabbedForm2.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2TabsController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/typeaheadExample.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"Forms2Tests.TypeaheadExample\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>Example Javascript</h5>\r\n      <p>For some fields it\'s nice to try and auto-fill values as users fill in the details.  It\'s possible to add typeahead support to input fields via \'input-attributes\'.  Seems to work best to attach the typeahead data to the config object.</p>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/welcome.html","<div class=\"row\" ng-controller=\"WelcomePageController\">\r\n  <div class=\"col-md-2\">\r\n  </div>\r\n  <div class=\"col-md-8\">\r\n    <div ng-bind-html=\"readme\"></div>\r\n  </div>\r\n  <div class=\"col-md-2\">\r\n  </div>\r\n\r\n</div>\r\n");
$templateCache.put("test-plugins/form2-examples/html/wizardForm2.html","<script type=\"text/ng-template\" id=\"markup.html\">\r\n  <div hawtio-form-2=\"config\" entity=\"model\"></div>\r\n</script>\r\n\r\n<div ng-controller=\"HawtioFormsTests.Forms2WizardController\">\r\n  <div class=\"row-fluid\">\r\n    <div class=\"col-md-4\">\r\n      <h5>JSON Config</h5>\r\n      <div hawtio-editor=\"configStr\" mode=\"javascript\"></div>\r\n      <p></p>\r\n      <h5>Markup</h5>\r\n      <div hawtio-editor=\"markup\" mode=\"html\"></div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>In Action</h5>\r\n        <div class=\"directive-example\">\r\n          <div compile=\"markup\"></div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-md-4\">\r\n      <div class=\"row-fluid\">\r\n        <h5>Model</h5>\r\n        <div hawtio-editor=\"modelStr\" mode=\"javascript\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n");}]); hawtioPluginLoader.addModule("hawtio-forms-test-templates");