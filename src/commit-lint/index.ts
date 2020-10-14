import {
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  url,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from "@schematics/angular/utility/dependencies";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export function main(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([addFiles(), installPackages(), addHuskyHook()])(
      tree,
      _context
    );
  };
}

export function addFiles(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const templates = url("./files");

    return mergeWith(templates)(tree, _context);
  };
}

export function installPackages(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const devDependencies: { [key: string]: string } = {
      "@commitlint/cli": "^9.1.2",
      "@commitlint/config-conventional": "^10.0.0",
      husky: "^4.2.5",
    };

    for (let pkg in devDependencies) {
      const nodeDependency: NodeDependency = {
        type: NodeDependencyType.Dev,
        name: pkg,
        version: devDependencies[pkg],
        overwrite: true,
      };

      addPackageJsonDependency(tree, nodeDependency);
    }

    _context.addTask(new NodePackageInstallTask());

    return tree;
  };
}

function addHuskyHook(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJsonBuffer = tree.read("package.json");

    if (!packageJsonBuffer) {
      throw new SchematicsException("No package.json file found");
    }

    const packageJsonObject = JSON.parse(packageJsonBuffer.toString());

    packageJsonObject["husky"] = {
      hooks: {
        "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      },
    };

    tree.overwrite("package.json", JSON.stringify(packageJsonObject, null, 2));

    return tree;
  };
}
