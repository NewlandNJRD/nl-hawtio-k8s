/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
declare var OSOAuthConfig: any;
declare var GoogleOAuthConfig: any;
declare var KeycloakConfig: any;
declare module Kubernetes {
    var _module: ng.IModule;
    var controller: (name: string, inlineAnnotatedConstructor: any[]) => ng.IModule;
    var route: (templateName: string, reloadOnSearch?: boolean) => {
        templateUrl: string;
        reloadOnSearch: boolean;
    };
}
