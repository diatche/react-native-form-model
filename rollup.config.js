import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

import pkg from './package.json';

const outputDefaults = {
    globals: {
        react: 'React',
        'react-native': 'ReactNative',
    },
};

const rnOutputDefaults = {
    ...outputDefaults,
    globals: {
        ...outputDefaults.globals,
    },
};

const baseConfig = {
    input: 'src/index.ts',
    external: [
        'rxjs/operators',
        'react-native-web',
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.optionalDependencies || {}),
    ],
};

const rnConfig = {
    ...baseConfig,
    output: [
        {
            ...rnOutputDefaults,
            dir: 'dist',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            outDir: 'dist',
            jsx: 'react',
            types: ['react', 'react-native'],
        }),
    ],
};

const tasks = [rnConfig];

export default args => {
    if (args.copy) {
        console.debug('Copying output to: ' + args.copy);
        return tasks.map(task => ({
            ...task,
            plugins: [
                ...task.plugins,
                copy({
                    targets: task.output
                        .map(output => ({
                            src: output.dir,
                            dest: args.copy,
                        }))
                        .concat([
                            {
                                src: 'src',
                                dest: args.copy,
                            },
                        ]),
                    hook: 'writeBundle', // Copy after writing to disk
                    verbose: true,
                }),
            ],
        }));
    }
    return tasks;
};
