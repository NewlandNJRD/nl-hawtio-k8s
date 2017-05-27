/// <reference path="../../includes.ts"/>

module Kubernetes {
 
  export var schema = 
  {
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
  }


}