'use strict';

/**
 * Resolve @be/<skill> packages from a configurable skills root (siblings of Be)
 * instead of node_modules. Install before requiring the Be bundle so both
 * require('@be/…') and PathUtils.resolve / resolveAssetPack work.
 *
 * Also puts Be's node_modules on NODE_PATH so sibling skills can still
 * require('jibo') and other host runtime deps (previously found by walking
 * up from node_modules/@be/<skill>).
 */

const Module = require('module');
const fs = require('fs');
const path = require('path');

let skillsRoot = null;
let beRoot = null;
let installed = false;

function parseBeRequest(request) {
    if (typeof request !== 'string' || request.indexOf('@be/') !== 0) {
        return null;
    }
    const rest = request.slice('@be/'.length);
    if (!rest) {
        return null;
    }
    const slash = rest.indexOf('/');
    if (slash === -1) {
        return { pkg: rest, subpath: null };
    }
    return {
        pkg: rest.slice(0, slash),
        subpath: rest.slice(slash + 1)
    };
}

function readPackageMain(pkgDir) {
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    const meta = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    return path.resolve(pkgDir, meta.main || 'index.js');
}

function exposeBeNodeModules(root) {
    const beNm = path.join(root, 'node_modules');
    const existing = process.env.NODE_PATH || '';
    const parts = existing.split(path.delimiter).filter(Boolean);
    if (parts.indexOf(beNm) === -1) {
        parts.unshift(beNm);
        process.env.NODE_PATH = parts.join(path.delimiter);
        Module._initPaths();
    }
}

function getSkillsRoot() {
    return skillsRoot;
}

function getBeRoot() {
    return beRoot;
}

function install() {
    if (installed) {
        return getSkillsRoot();
    }
    installed = true;

    beRoot = __dirname;
    const bePackage = require(path.join(beRoot, 'package.json'));
    const skillsRootRel = (bePackage.jibo && bePackage.jibo.skillsRoot) || '..';
    skillsRoot = path.isAbsolute(skillsRootRel)
        ? skillsRootRel
        : path.resolve(beRoot, skillsRootRel);

    exposeBeNodeModules(beRoot);

    const originalResolveFilename = Module._resolveFilename;
    Module._resolveFilename = function (request, parent, isMain, options) {
        const parsed = parseBeRequest(request);
        if (parsed) {
            const pkgDir = path.join(skillsRoot, parsed.pkg);
            const pkgJsonPath = path.join(pkgDir, 'package.json');
            if (fs.existsSync(pkgJsonPath)) {
                if (!parsed.subpath) {
                    return readPackageMain(pkgDir);
                }
                const subAbs = path.resolve(pkgDir, parsed.subpath);
                if (fs.existsSync(subAbs) && fs.statSync(subAbs).isFile()) {
                    return subAbs;
                }
                const fakeParent = {
                    id: path.join(pkgDir, 'noop.js'),
                    filename: path.join(pkgDir, 'noop.js'),
                    paths: Module._nodeModulePaths(pkgDir)
                };
                try {
                    return originalResolveFilename.call(
                        this,
                        './' + parsed.subpath,
                        fakeParent,
                        isMain,
                        options
                    );
                } catch (err) {
                    // Fall through to default resolution
                }
            }
        }
        return originalResolveFilename.apply(this, arguments);
    };

    return skillsRoot;
}

module.exports = {
    install: install,
    getSkillsRoot: getSkillsRoot,
    getBeRoot: getBeRoot
};
