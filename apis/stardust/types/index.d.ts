// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.
/// <reference types="qlik-engineapi" />
/**
 * Initiates a new `Embed` instance using the specified enigma `app`.
 * @param app
 * @param instanceConfig
 */
export function embed(app: EngineAPI.IApp, instanceConfig?: stardust.Configuration): stardust.Embed;

export namespace embed {
    /**
     * Creates a new `embed` scope bound to the specified `configuration`.
     * 
     * The configuration is merged with all previous scopes.
     * @param configuration The configuration object
     */
    function createConfiguration(configuration: stardust.Configuration): typeof embed;

}

/**
 * Creates a stateful value.
 * @param initialState The initial state.
 */
export function useState<S>(initialState: S | (()=>S)): [S, stardust.SetStateFn<S>];

/**
 * Triggers a callback function when a dependent value changes.
 * @param effect The callback.
 * @param deps The dependencies that should trigger the callback.
 */
export function useEffect(effect: stardust.EffectCallback, deps?: any[]): void;

/**
 * Creates a stateful value when a dependent changes.
 * @param factory The factory function.
 * @param deps The dependencies.
 */
export function useMemo<T>(factory: ()=>T, deps: any[]): T;

/**
 * Runs a callback function when a dependent changes.
 * @param factory The factory function that calls the promise.
 * @param deps The dependencies.
 */
export function usePromise<P>(factory: ()=>Promise<P>, deps?: any[]): [P, Error];

/**
 * Gets the HTMLElement this visualization is rendered into.
 */
export function useElement(): HTMLElement;

/**
 * Gets the size of the HTMLElement the visualization is rendered into.
 */
export function useRect(): stardust.Rect;

/**
 * Gets the layout of the generic object associated with this visualization.
 */
export function useLayout(): EngineAPI.IGenericObjectLayout;

/**
 * Gets the layout of the generic object associated with this visualization.
 * 
 * Unlike the regular layout, a _stale_ layout is not changed when a generic object enters
 * the modal state. This is mostly notable in that `qSelectionInfo.qInSelections` in the layout is
 * always `false`.
 * The returned value from `useStaleLayout()` and `useLayout()` are identical when the object
 * is not in a modal state.
 */
export function useStaleLayout(): EngineAPI.IGenericObjectLayout;

/**
 * Gets the layout of the app associated with this visualization.
 */
export function useAppLayout(): EngineAPI.INxAppLayout;

/**
 * Gets the generic object API of the generic object connected to this visualization.
 */
export function useModel(): EngineAPI.IGenericObject | undefined;

/**
 * Gets the doc API.
 */
export function useApp(): EngineAPI.IApp | undefined;

/**
 * Gets the global API.
 */
export function useGlobal(): EngineAPI.IGlobal | undefined;

/**
 * Gets the object selections.
 */
export function useSelections(): stardust.ObjectSelections;

/**
 * Gets the theme.
 */
export function useTheme(): stardust.Theme;

/**
 * Gets the embed instance used.
 */
export function useEmbed(): stardust.Embed;

/**
 * Gets the translator.
 */
export function useTranslator(): stardust.Translator;

/**
 * Gets the device type. ('touch' or 'desktop')
 */
export function useDeviceType(): string;

/**
 * Gets the array of plugins provided when rendering the visualization.
 */
export function usePlugins(): stardust.Plugin[];

/**
 * Registers a custom action.
 * @param factory
 * @param deps
 */
export function useAction<A>(factory: ()=>stardust.ActionDefinition<A>, deps?: any[]): A;

/**
 * Gets the desired constraints that should be applied when rendering the visualization.
 * 
 * The constraints are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 * @deprecated
 */
export function useConstraints(): stardust.Constraints;

/**
 * Gets the desired interaction states that should be applied when rendering the visualization.
 * 
 * The interactions are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 */
export function useInteractionState(): stardust.Interactions;

/**
 * Gets the options object provided when rendering the visualization.
 * 
 * This is an empty object by default but enables customization of the visualization through this object.
 * Options are different from setting properties on the generic object in that options
 * are only temporary settings applied to the visualization when rendered.
 * 
 * You have the responsibility to provide documentation of the options you support, if any.
 */
export function useOptions(): object;

/**
 * Registers a callback that is called when a snapshot is taken.
 * @param snapshotCallback
 */
export function onTakeSnapshot(snapshotCallback: ($: EngineAPI.IGenericObjectLayout)=>Promise<EngineAPI.IGenericObjectLayout>): void;

/**
 * Gets render state instance.
 * 
 * Used to update properties and get a new layout without triggering onInitialRender.
 */
export function useRenderState(): stardust.RenderState;

/**
 * Gets an event emitter instance for the visualization.
 */
export function useEmitter(): Emitter;

/**
 * Gets the desired keyboard settings and status to applied when rendering the visualization.
 * A visualization should in general only have tab stops if either `keyboard.enabled` is false or if active is true.
 * This means that either Nebula isn't configured to handle keyboard input or the chart is currently focused.
 * Enabling or disabling keyboardNavigation are set on the embed configuration and
 * should be respected by the visualization.
 */
export function useKeyboard(): stardust.Keyboard;

/**
 * Provides conversion functionality to extensions.
 */
export namespace Conversion {
    /**
     * Provides conversion functionality to extensions with hyperCubes.
     */
    const hypercube: stardust.hyperCubeConversion;

}

/**
 * Mocks Engima app functionality for demo and testing purposes.
 */
export namespace EnigmaMocker {
    /**
     * Mocks Engima app functionality. It accepts one / many generic objects as input argument and returns the mocked Enigma app. Each generic object represents one visulization and specifies how it behaves. For example, what layout to use the data to present.
     * 
     * The generic object is represented with a Javascript object with a number of properties. The name of the property correlates to the name in the Enigma model for `app.getObject(id)`. For example, the property `getLayout` in the generic object is used to define `app.getObject(id).getLayout()`. Any property can be added to the fixture (just make sure it exists and behaves as in the Enigma model!).
     * 
     * The value for each property is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.
     * @param genericObjects Generic objects controling behaviour of visualizations.
     * @param options Options
     */
    function fromGenericObjects(genericObjects: object[], options?: stardust.EnigmaMockerOptions): Promise<EngineAPI.IApp>;

}

declare namespace stardust {
    interface Configuration {
        load?: stardust.LoadType;
        context?: stardust.Context;
        types?: stardust.TypeInfo[];
        themes?: stardust.ThemeInfo[];
        anything?: object;
    }

    interface Context {
        theme?: string;
        language?: string;
        deviceType?: string;
        constraints?: stardust.Constraints;
        interactions?: stardust.Interactions;
        keyboardNavigation?: boolean;
        disableCellPadding?: boolean;
    }

    interface Galaxy {
        translator: stardust.Translator;
        flags: stardust.Flags;
        deviceType: string;
        anything: object;
    }

    class Embed {
        constructor();

        /**
         * Renders a visualization or sheet into an HTMLElement.
         * Visualizations can either be existing objects or created on the fly.
         * Support for sense sheets is experimental.
         * @param cfg The render configuration.
         */
        render(cfg: stardust.RenderConfig): Promise<stardust.Viz | stardust.Sheet>;

        /**
         * Creates a visualization model
         * @param cfg The create configuration.
         */
        create(cfg: stardust.CreateConfig): Promise<EngineAPI.IGenericObject>;

        /**
         * Generates properties for a visualization object
         * @param cfg The create configuration.
         */
        generateProperties(cfg: stardust.CreateConfig): Promise<object>;

        /**
         * Updates the current context of this embed instance.
         * Use this when you want to change some part of the current context, like theme.
         * @param ctx The context to update.
         */
        context(ctx: stardust.Context): Promise<undefined>;

        /**
         * Gets the app selections of this instance.
         */
        selections(): Promise<stardust.AppSelections>;

        /**
         * Gets the listbox instance of the specified field
         * @param fieldIdentifier Fieldname as a string, a Library dimension or an object id
         */
        field(fieldIdentifier: string | stardust.LibraryField | stardust.QInfo): Promise<stardust.FieldInstance>;

        /**
         * Gets a list of registered visualization types and versions
         */
        getRegisteredTypes(): Object[];

    }

    type Direction = "ltr" | "rtl";

    type ListLayout = "vertical" | "horizontal";

    type FrequencyMode = "none" | "value" | "percent" | "relative";

    type SearchMode = boolean | "toggle";

    type FieldEventTypes = "selectionActivated" | "selectionDeactivated";

    class FieldInstance {
        constructor();

        /**
         * Event listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        on(eventType: stardust.FieldEventTypes, callback: ()=>void): void;

        /**
         * Remove listener on instance
         * @param eventType event type
         * @param callback handler
         */
        removeListener(eventType: stardust.FieldEventTypes, callback: ()=>void): void;

        /**
         * Mounts the field as a listbox into the provided HTMLElement.
         * @param element
         * @param options Settings for the embedded listbox
         */
        mount(element: HTMLElement, options?: {
            title?: string;
            direction?: stardust.Direction;
            listLayout?: stardust.ListLayout;
            frequencyMode?: stardust.FrequencyMode;
            histogram?: boolean;
            search?: stardust.SearchMode;
            toolbar?: boolean;
            checkboxes?: boolean;
            dense?: boolean;
            stateName?: string;
            properties?: object;
        }): Promise<void>;

        /**
         * Unmounts the field listbox from the DOM.
         */
        unmount(): void;

    }

    type ThemeJSON = any;

    interface ThemeInfo {
        id: string;
        /**
         * A function that should return a Promise that resolves to a raw JSON theme.
         */
        load(): Promise<stardust.ThemeJSON>;
    }

    interface QInfo {
        qId: string;
    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Sheet {
        constructor();

        id: string;

        model: string;

        /**
         * Destroys the sheet and removes it from the the DOM.
         */
        destroy(): void;

    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Viz {
        constructor();

        id: string;

        model: EngineAPI.IGenericObject;

        /**
         * Destroys the visualization and removes it from the the DOM.
         */
        destroy(): void;

        /**
         * Converts the visualization to a different registered type
         * @param newType Which registered type to convert to.
         * @param forceUpdate Whether to run setProperties or not, defaults to true.
         */
        convertTo(newType: string, forceUpdate?: boolean): Promise<object>;

        /**
         * Listens to custom events from inside the visualization. See useEmitter
         * @param eventName Event name to listen to
         * @param listener Callback function to invoke
         */
        on(eventName: string, listener: ()=>void): void;

        /**
         * Removes a listener
         * @param eventName Event name to remove from
         * @param listener Callback function to remove
         */
        off(eventName: string, listener: ()=>void): void;

    }

    interface Flags {
        /**
         * Checks whether the specified flag is enabled.
         * @param flag The value flag to check.
         */
        isEnabled(flag: string): boolean;
    }

    class AppSelections {
        constructor();

        /**
         * Mounts the app selection UI into the provided HTMLElement.
         * @param element
         */
        mount(element: HTMLElement): void;

        /**
         * Unmounts the app selection UI from the DOM.
         */
        unmount(): void;

    }

    class ObjectSelections {
        constructor();

        /**
         * Event listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        on(eventType: string, callback: ()=>void): void;

        /**
         * Remove listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        removeListener(eventType: string, callback: ()=>void): void;

        /**
         * @param paths
         */
        begin(paths: string[]): Promise<undefined>;

        clear(): Promise<undefined>;

        confirm(): Promise<undefined>;

        cancel(): Promise<undefined>;

        /**
         * @param s
         */
        select(s: {
            method: string;
            params: any[];
        }): Promise<boolean>;

        canClear(): boolean;

        canConfirm(): boolean;

        canCancel(): boolean;

        isActive(): boolean;

        isModal(): boolean;

        /**
         * @param paths
         */
        goModal(paths: string[]): Promise<undefined>;

        /**
         * @param accept
         */
        noModal(accept?: boolean): Promise<undefined>;

    }

    /**
     * An object literal containing meta information about the plugin and a function containing the plugin implementation.
     */
    interface Plugin {
        info: {
            name: string;
        };
        fn: ()=>void;
    }

    type Field = string | EngineAPI.INxDimension | EngineAPI.INxMeasure | stardust.LibraryField;

    /**
     * Rendering configuration for creating and rendering a new object
     */
    interface CreateConfig {
        type: string;
        version?: string;
        fields?: stardust.Field[];
        properties?: EngineAPI.IGenericObjectProperties;
    }

    /**
     * Configuration for rendering a visualisation, either creating or fetching an existing object.
     */
    interface RenderConfig {
        element: HTMLElement;
        options?: object;
        plugins?: stardust.Plugin[];
        id?: string;
        type?: string;
        version?: string;
        fields?: stardust.Field[];
        extendProperties?: boolean;
        properties?: EngineAPI.IGenericObjectProperties;
    }

    interface LibraryField {
        qLibraryId: string;
        type: "dimension" | "measure";
    }

    interface LoadType {
        (type: {
            name: string;
            version: string;
        }): Promise<stardust.Visualization>;
    }

    interface TypeInfo {
        name: string;
        version?: string;
        load: stardust.LoadType;
        meta?: object;
    }

    interface ActionToolbarElement extends HTMLElement{
        className: "njs-action-toolbar-popover";
    }

    interface ActionElement extends HTMLElement{
        className: "njs-cell-action";
    }

    interface CellElement extends HTMLElement{
        className: "njs-cell";
    }

    interface CellFooter extends HTMLElement{
        className: "njs-cell-footer";
    }

    interface CellTitle extends HTMLElement{
        className: "njs-cell-title";
    }

    interface CellSubTitle extends HTMLElement{
        className: "njs-cell-sub-title";
    }

    interface SheetElement extends HTMLElement{
        className: "njs-sheet";
    }

    interface VizElementAttributes extends NamedNodeMap{
        "data-render-count": string;
    }

    interface VizElement extends HTMLElement{
        attributes: stardust.VizElementAttributes;
        className: "njs-viz";
    }

    /**
     * The entry point for defining a visualization.
     */
    interface Visualization {
        (galaxy: stardust.Galaxy): stardust.VisualizationDefinition;
    }

    interface VisualizationDefinition {
        qae: stardust.QAEDefinition;
        component(): void;
    }

    interface SetStateFn<S> {
        (newState: S | (($: S)=>S)): void;
    }

    type EffectCallback = ()=>void | (()=>void);

    interface Rect {
        top: number;
        left: number;
        width: number;
        height: number;
    }

    interface ActionDefinition<A> {
        action: A;
        hidden?: boolean;
        disabled?: boolean;
        icon?: {
            viewBox?: string;
            shapes: {
            }[];
        };
    }

    /**
     * @deprecated
     */
    interface Constraints {
        passive?: boolean;
        active?: boolean;
        select?: boolean;
        edit?: boolean;
    }

    interface Interactions {
        passive?: boolean;
        active?: boolean;
        select?: boolean;
        edit?: boolean;
    }

    interface RenderState {
        pending: any;
        restore: any;
    }

    /**
     * Blur function
     */
    type BlurFunction = (resetFocus: boolean)=>void;

    /**
     * Focus Selection function
     */
    type FocusSelectionFunction = (focusLast: boolean)=>void;

    interface Keyboard {
        enabled: boolean;
        active: boolean;
        blur: stardust.BlurFunction;
        /**
         * Function used by the visualization to tell Nebula to it wants focus
         */
        focus?(): void;
        focusSelection: stardust.FocusSelectionFunction;
    }

    /**
     * Imports properties for a chart with a hypercube.
     */
    type importProperties = (args: {
        exportFormat: stardust.ExportFormat;
        initialProperties?: Object;
        dataDefinition?: Object;
        defaultPropertyValues?: Object;
        hypercubePath: string;
    })=>Object;

    /**
     * Exports properties for a chart with a hypercube.
     */
    type exportProperties = (args: {
        propertyTree: Object;
        hypercubePath: string;
    })=>stardust.ExportFormat;

    interface QAEDefinition {
        properties?: EngineAPI.IGenericObjectProperties;
        data?: {
            targets: stardust.DataTarget[];
        };
        importProperties?: stardust.importProperties;
        exportProperties?: stardust.exportProperties;
    }

    interface DataTarget {
        path: string;
        dimensions?: stardust.FieldTarget<EngineAPI.INxDimension>;
        measures?: stardust.FieldTarget<EngineAPI.INxMeasure>;
    }

    type fieldTargetAddedCallback<T> = (field: T, properties: EngineAPI.IGenericObjectProperties)=>void;

    type fieldTargetRemovedCallback<T> = (field: T, properties: EngineAPI.IGenericObjectProperties, index: number)=>void;

    interface FieldTarget<T> {
        min?: (()=>void) | number;
        max?: (()=>void) | number;
        added?: stardust.fieldTargetAddedCallback<T>;
        removed?: stardust.fieldTargetRemovedCallback<T>;
    }

    class Translator {
        constructor();

        /**
         * Returns current locale.
         */
        language(): string;

        /**
         * Registers a string in multiple locales
         * @param item
         */
        add(item: {
            id: string;
            locale: object;
        }): void;

        /**
         * Translates a string for current locale.
         * @param str ID of the registered string.
         * @param args Values passed down for string interpolation.
         */
        get(str: string, args?: string[]): string;

    }

    class Theme {
        constructor();

        /**
         * Returns theme name
         */
        name(): string;

        getDataColorScales(): stardust.Theme.ScalePalette[];

        getDataColorPalettes(): stardust.Theme.DataPalette[];

        getDataColorPickerPalettes(): stardust.Theme.ColorPickerPalette[];

        getDataColorSpecials(): stardust.Theme.DataColorSpecials;

        /**
         * Resolve a color object using the color picker palette from the provided JSON theme.
         * @param c
         * @param supportNone Shifts the palette index by one to account for the "none" color
         */
        getColorPickerColor(c: {
            index?: number;
            color?: string;
        }, supportNone?: boolean): string;

        /**
         * Get the best contrasting color against the specified `color`.
         * This is typically used to find a suitable text color for a label placed on an arbitrarily colored background.
         * 
         * The returned colors are derived from the theme.
         * @param color A color to measure the contrast against
         */
        getContrastingColorTo(color: string): string;

        /**
         * Get the value of a style attribute in the theme
         * by searching in the theme's JSON structure.
         * The search starts at the specified base path
         * and continues upwards until the value is found.
         * If possible it will get the attribute's value using the given path.
         * When attributes separated by dots are provided, such as 'hover.color',
         * they are required in the theme JSON file
         * @param basePath Base path in the theme's JSON structure to start the search in (specified as a name path separated by dots).
         * @param path Expected path for the attribute (specified as a name path separated by dots).
         * @param attribute Name of the style attribute. (specified as a name attribute separated by dots).
         */
        getStyle(basePath: string, path: string, attribute: string): string | undefined;

    }

    namespace Theme {
        interface ScalePalette {
            key: string;
            type: "gradient" | "class-pyramid";
            colors: string[] | (string[])[];
        }

        interface DataPalette {
            key: string;
            type: "pyramid" | "row";
            colors: string[] | (string[])[];
        }

        interface ColorPickerPalette {
            key: string;
            colors: string[];
        }

        interface DataColorSpecials {
            primary: string;
            nil: string;
            others: string;
        }

    }

    /**
     * Used for exporting and importing properties between backend models. An object that exports to
     * ExportFormat should put dimensions and measures inside one data group. If an object has two hypercubes,
     * each of the cubes should export dimensions and measures in two separate data groups.
     * An object that imports from this structure is responsible for putting the existing properties where they should be
     * in the new model.
     */
    interface ExportFormat {
        data?: stardust.ExportDataDef[];
        properties?: object;
    }

    interface ExportDataDef {
        dimensions: EngineAPI.INxDimension[];
        measures: EngineAPI.INxMeasure[];
        excludedDimensions: EngineAPI.INxDimension[];
        excludedMeasures: EngineAPI.INxMeasure[];
        interColumnSortOrder: number[];
    }

    interface ConversionType {
        importProperties: stardust.importProperties;
        exportProperties: stardust.exportProperties;
    }

    interface hyperCubeConversion {
    }

    /**
     * Options for Enigma Mocker
     */
    interface EnigmaMockerOptions {
        delay: number;
    }

}

