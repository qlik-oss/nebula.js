// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.
import * as qix from '@qlik/api/qix';
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
 * Initiates a new `Embed` instance using the specified enigma `app`.
 * @param app
 * @param instanceConfig
 */
export function embed(app: qix.Doc, instanceConfig?: stardust.Configuration): stardust.Embed;

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
 * Mocks Engima app functionality for demo and testing purposes.
 */
export namespace EnigmaMocker {
    /**
     * Mocks Engima app functionality. It accepts one / many generic objects as input argument and returns the mocked Enigma app. Each generic object represents one visualisation and specifies how it behaves. For example, what layout to use the data to present.
     * 
     * The generic object is represented with a Javascript object with a number of properties. The name of the property correlates to the name in the Enigma model for `app.getObject(id)`. For example, the property `getLayout` in the generic object is used to define `app.getObject(id).getLayout()`. Any property can be added to the fixture (just make sure it exists and behaves as in the Enigma model!).
     * 
     * The value for each property is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.
     * @param genericObjects Generic objects controlling behaviour of visualizations.
     * @param options Options
     */
    function fromGenericObjects(genericObjects: object[], options?: stardust.EnigmaMockerOptions): Promise<qix.Doc>;

}

/**
 * Registers a callback that is called when a snapshot is taken.
 * @param snapshotCallback
 */
export function onTakeSnapshot(snapshotCallback: ($: qix.GenericObjectLayout)=>Promise<qix.GenericObjectLayout>): void;

/**
 * Registers a custom action.
 * @param factory
 * @param deps
 */
export function useAction<A>(factory: ()=>stardust.ActionDefinition<A>, deps?: any[]): A;

/**
 * Gets the doc API.
 */
export function useApp(): qix.Doc | undefined;

/**
 * Gets the layout of the app associated with this visualization.
 */
export function useAppLayout(): qix.NxAppLayout;

/**
 * Gets the desired constraints that should be applied when rendering the visualization.
 * 
 * The constraints are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 * @deprecated
 */
export function useConstraints(): stardust.Constraints;

/**
 * Gets the device type. ('touch' or 'desktop')
 */
export function useDeviceType(): string;

/**
 * Triggers a callback function when a dependent value changes.
 * 
 * Omitting the dependency array will have the hook run on each update
 * and an empty dependency array runs only once.
 * @param effect The callback.
 * @param deps The dependencies that should trigger the callback.
 */
export function useEffect(effect: stardust.EffectCallback, deps?: any[]): void;

/**
 * Gets the HTMLElement this visualization is rendered into.
 */
export function useElement(): HTMLElement;

/**
 * Gets the embed instance used.
 */
export function useEmbed(): stardust.Embed;

/**
 * Gets an event emitter instance for the visualization.
 */
export function useEmitter(): stardust.Emitter;

/**
 * Gets the global API.
 */
export function useGlobal(): qix.Global | undefined;

/**
 * This is an empty object by default, but enables you to provide a custom API of your visualization to
 * make it possible to control after it has been rendered.
 * 
 * You can only use this hook once, calling it more than once is considered an error.
 * @param factory
 * @param deps
 */
export function useImperativeHandle<T>(factory: ()=>T, deps?: any[]): void;

/**
 * Gets the desired interaction states that should be applied when rendering the visualization.
 * 
 * The interactions are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 */
export function useInteractionState(): stardust.Interactions;

/**
 * Gets the desired keyboard settings and status to applied when rendering the visualization.
 * A visualization should in general only have tab stops if either `keyboard.enabled` is false or if active is true.
 * This means that either Nebula isn't configured to handle keyboard input or the chart is currently focused.
 * Enabling or disabling keyboardNavigation are set on the embed configuration and
 * should be respected by the visualization.
 */
export function useKeyboard(): stardust.Keyboard;

/**
 * Gets the layout of the generic object associated with this visualization.
 */
export function useLayout(): qix.GenericObjectLayout;

/**
 * Creates a stateful value when a dependent changes.
 * @param factory The factory function.
 * @param deps The dependencies.
 */
export function useMemo<T>(factory: ()=>T, deps: any[]): T;

/**
 * Gets the generic object API of the generic object connected to this visualization.
 */
export function useModel(): qix.GenericObject | undefined;

/**
 * Gets the navigation api to control sheet navigation. When useNavigation is used in Sense, it returns Sense.navigation.
 */
export function useNavigation(): stardust.Navigation;

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
 * Gets the array of plugins provided when rendering the visualization.
 */
export function usePlugins(): stardust.Plugin[];

/**
 * Runs a callback function when a dependent changes.
 * 
 * Useful for async operations that otherwise cause no side effects.
 * Do not add for example listeners withing the callback as there is no teardown function.
 * @param factory The factory function that calls the promise.
 * @param deps The dependencies.
 */
export function usePromise<P>(factory: ()=>Promise<P>, deps?: any[]): [P, Error];

/**
 * Gets the size of the HTMLElement the visualization is rendered into.
 */
export function useRect(): stardust.Rect;

/**
 * Creates a reference to a value not needed for rendering
 * 
 * While Nebula does not have a virtual DOM, it is still useful
 * to have a reference to an object that is retained across
 * renders and in it self does not trigger a render.
 * @param initialValue The initial value.
 */
export function useRef<R>(initialValue: R): stardust.Ref<R>;

/**
 * Gets render state instance.
 * 
 * Used to update properties and get a new layout without triggering onInitialRender.
 */
export function useRenderState(): stardust.RenderState;

/**
 * Gets the object selections.
 */
export function useSelections(): stardust.ObjectSelections;

/**
 * Gets the layout of the generic object associated with this visualization.
 * 
 * Unlike the regular layout, a _stale_ layout is not changed when a generic object enters
 * the modal state. This is mostly notable in that `qSelectionInfo.qInSelections` in the layout is
 * always `false`.
 * The returned value from `useStaleLayout()` and `useLayout()` are identical when the object
 * is not in a modal state.
 */
export function useStaleLayout(): qix.GenericObjectLayout;

/**
 * Creates a stateful value.
 * @param initialState The initial state.
 */
export function useState<S>(initialState: S | (()=>S)): [S, stardust.SetStateFn<S>];

/**
 * Gets the theme.
 */
export function useTheme(): stardust.Theme;

/**
 * Gets the translator.
 */
export function useTranslator(): stardust.Translator;

declare namespace stardust {
    interface ActionDefinition<A> {
        action: A;
        disabled?: boolean;
        hidden?: boolean;
        icon?: {
            viewBox?: string;
            shapes: {
            }[];
        };
    }

    interface ActionElement extends HTMLElement {
        className: "njs-cell-action";
    }

    interface ActionToolbarElement extends HTMLElement {
        className: "njs-action-toolbar-popover";
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

    interface CellBody extends HTMLElement {
        className: "njs-cell-body";
    }

    interface CellElement extends HTMLElement {
        className: "njs-cell";
    }

    interface CellFooter extends HTMLElement {
        className: "njs-cell-footer";
    }

    interface CellSubTitle extends HTMLElement {
        className: "njs-cell-sub-title";
    }

    interface CellTitle extends HTMLElement {
        className: "njs-cell-title";
    }

    interface Component {
        key: string;
    }

    interface Configuration {
        anything?: object;
        context?: stardust.Context;
        hostConfig?: object;
        load?: stardust.LoadFallback;
        themes?: stardust.ThemeInfo[];
        types?: stardust.TypeInfo[];
    }

    /**
     * @deprecated
     */
    interface Constraints {
        active?: boolean;
        edit?: boolean;
        passive?: boolean;
        select?: boolean;
    }

    interface Context {
        constraints?: stardust.Constraints;
        dataViewType?: string;
        deviceType?: string;
        disableCellPadding?: boolean;
        interactions?: stardust.Interactions;
        keyboardNavigation?: boolean;
        language?: string;
        navigation?: stardust.Navigation;
        theme?: string;
    }

    interface ConversionType {
        exportProperties: stardust.exportProperties;
        importProperties: stardust.importProperties;
    }

    /**
     * Rendering configuration for creating and rendering a new object
     */
    interface CreateConfig {
        type: string;
        fields?: stardust.Field[];
        properties?: qix.GenericObjectProperties;
        version?: string;
    }

    interface DataTarget {
        path: string;
        dimensions?: stardust.FieldTarget<qix.NxDimension>;
        measures?: stardust.FieldTarget<qix.NxMeasure>;
    }

    type Direction = "ltr" | "rtl";

    /**
     * Callback function that should return a function that in turns gets
     * called before the hook runs again or when the component is destroyed.
     * For example to remove any listeners added in the callback itself.
     */
    type EffectCallback = ()=>void | (()=>void);

    class Embed {
        constructor();

        /**
         * Updates the current context of this embed instance.
         * Use this when you want to change some part of the current context, like theme.
         * @param ctx The context to update.
         */
        context(ctx: stardust.Context): Promise<undefined>;

        /**
         * Creates a visualization model
         * @param cfg The create configuration.
         */
        create(cfg: stardust.CreateConfig): Promise<qix.GenericObject>;

        /**
         * Gets the listbox instance of the specified field
         * @param fieldIdentifier Fieldname as a string, a Library dimension or an object id
         */
        field(fieldIdentifier: string | stardust.LibraryField | stardust.QInfo): Promise<stardust.FieldInstance>;

        /**
         * Generates properties for a visualization object
         * @param cfg The create configuration.
         */
        generateProperties(cfg: stardust.CreateConfig): Promise<object>;

        /**
         * Gets a list of registered visualization types and versions
         */
        getRegisteredTypes(): Object[];

        /**
         * Renders a visualization or sheet into an HTMLElement.
         * Visualizations can either be existing objects or created on the fly.
         * Support for sense sheets is experimental.
         * @param cfg The render configuration.
         */
        render(cfg: stardust.RenderConfig): Promise<stardust.Viz | stardust.Sheet>;

        /**
         * Gets the app selections of this instance.
         */
        selections(): Promise<stardust.AppSelections>;

    }

    class Emitter {
        constructor();

    }

    /**
     * Options for Enigma Mocker
     */
    interface EnigmaMockerOptions {
        delay: number;
        appMethods?: object;
    }

    interface ExportDataDef {
        dimensions: qix.NxDimension[];
        excludedDimensions: qix.NxDimension[];
        excludedMeasures: qix.NxMeasure[];
        interColumnSortOrder: number[];
        measures: qix.NxMeasure[];
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

    /**
     * Exports properties for a chart with a hypercube.
     */
    type exportProperties = (args: {
        hypercubePath: string;
        propertyTree: Object;
    })=>stardust.ExportFormat;

    type Field = string | qix.NxDimension | qix.NxMeasure | stardust.LibraryField;

    type FieldEventTypes = "selectionActivated" | "selectionDeactivated";

    class FieldInstance {
        constructor();

        /**
         * Mounts the field as a listbox into the provided HTMLElement.
         * @param element
         * @param options Settings for the embedded listbox
         */
        mount(element: HTMLElement, options?: {
            checkboxes?: boolean;
            components?: stardust.Component[];
            dense?: boolean;
            direction?: stardust.Direction;
            frequencyMode?: stardust.FrequencyMode;
            histogram?: boolean;
            listLayout?: stardust.ListLayout;
            properties?: object;
            search?: stardust.SearchMode;
            showLock?: boolean;
            stateName?: string;
            title?: string;
            toolbar?: boolean;
            toolbarMode?: stardust.ToolbarMode;
        }): Promise<void>;

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
         * Unmounts the field listbox from the DOM.
         */
        unmount(): void;

    }

    interface FieldTarget<T> {
        added?: stardust.fieldTargetAddedCallback<T>;
        max?: (()=>void) | number;
        min?: (()=>void) | number;
        removed?: stardust.fieldTargetRemovedCallback<T>;
    }

    type fieldTargetAddedCallback<T> = (field: T, properties: qix.GenericObjectProperties)=>void;

    type fieldTargetRemovedCallback<T> = (field: T, properties: qix.GenericObjectProperties, index: number)=>void;

    interface Flags {
        /**
         * Checks whether the specified flag is enabled.
         * @param flag The value flag to check.
         */
        isEnabled(flag: string): boolean;
    }

    type FrequencyMode = "none" | "value" | "percent" | "relative";

    interface Galaxy {
        anything: object;
        deviceType: string;
        flags: stardust.Flags;
        hostConfig: object;
        theme: stardust.Theme;
        translator: stardust.Translator;
    }

    interface hyperCubeConversion {
    }

    /**
     * Imports properties for a chart with a hypercube.
     */
    type importProperties = (args: {
        exportFormat: stardust.ExportFormat;
        hypercubePath: string;
        dataDefinition?: Object;
        defaultPropertyValues?: Object;
        initialProperties?: Object;
    })=>Object;

    interface Interactions {
        active?: boolean;
        edit?: boolean;
        passive?: boolean;
        select?: boolean;
    }

    interface Keyboard {
        active: boolean;
        enabled: boolean;
        /**
         * Function used by the visualization to tell Nebula it wants to relinquish focus
         * @param $
         */
        blur?($: boolean): void;
        /**
         * Function used by the visualization to tell Nebula it wants to focus
         */
        focus?(): void;
        /**
         * Function used by the visualization to tell Nebula that focus the selection toolbar
         * @param $
         */
        focusSelection?($: boolean): void;
    }

    interface LibraryField {
        qLibraryId: string;
        type: "dimension" | "measure";
    }

    type ListLayout = "vertical" | "horizontal";

    /**
     * Fallback load function for missing types
     */
    type LoadFallback = ($: stardust.LoadType)=>Promise<stardust.Visualization>;

    interface LoadType {
        (type: {
            name: string;
            version: string;
        }): Promise<stardust.Visualization>;
    }

    /**
     * Move an element from position old_index to position new_index in
     * the array.
     */
    type move = (array: any, oldIndex: any, newIndex: any)=>void;

    class Navigation implements stardust.Emitter {
        constructor();

        /**
         * Return the current sheet id
         */
        getCurrentSheetId(): string | "false";

        /**
         * Navigate to the supplied sheet and emit 'sheetChanged' event if the target sheet Id is valid.
         * This allows a navigation object to synchronize its current sheet item with the active sheet.
         * @param sheetId Id of the sheet to navigate to
         */
        goToSheet(sheetId: string): void;

    }

    class ObjectSelections {
        constructor();

        /**
         * Event listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        addListener(eventType: string, callback: ()=>void): void;

        /**
         * @param paths
         */
        begin(paths: string[]): Promise<undefined>;

        canCancel(): boolean;

        cancel(): Promise<undefined>;

        canClear(): boolean;

        canConfirm(): boolean;

        clear(): Promise<undefined>;

        confirm(): Promise<undefined>;

        /**
         * @param paths
         */
        goModal(paths: string[]): Promise<undefined>;

        isActive(): boolean;

        isModal(): boolean;

        /**
         * @param accept
         */
        noModal(accept?: boolean): Promise<undefined>;

        /**
         * Remove listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        removeListener(eventType: string, callback: ()=>void): void;

        /**
         * @param s
         */
        select(s: {
            method: string;
            params: any[];
        }): Promise<boolean>;

    }

    type onPropertyChange = (properties: qix.GenericObjectProperties)=>void;

    /**
     * An object literal containing meta information about the plugin and a function containing the plugin implementation.
     */
    interface Plugin {
        fn: ()=>void;
        info: {
            name: string;
        };
    }

    interface QAEDefinition {
        data?: {
            targets: stardust.DataTarget[];
        };
        exportProperties?: stardust.exportProperties;
        importProperties?: stardust.importProperties;
        properties?: stardust.QAEProperties | qix.GenericObjectProperties;
    }

    interface QAEProperties {
        initial?: qix.GenericObjectProperties;
        onChange?: stardust.onPropertyChange;
    }

    interface QInfo {
        qId: string;
    }

    interface Rect {
        height: number;
        left: number;
        top: number;
        width: number;
    }

    /**
     * Reference object returned from useRef
     */
    interface Ref<R> {
        current: R;
    }

    /**
     * Configuration for rendering a visualisation, either creating or fetching an existing object.
     */
    interface RenderConfig {
        element: HTMLElement;
        extendProperties?: boolean;
        fields?: stardust.Field[];
        id?: string;
        /**
         * Callback function called if an error occurs. Also called with AbortError when signal aborts.
         * @param $
         */
        onError?($: stardust.RenderError): void;
        /**
         * Callback function called after rendering successfully
         */
        onRender?(): void;
        options?: object;
        plugins?: stardust.Plugin[];
        properties?: qix.GenericObjectProperties;
        signal?: AbortSignal;
        type?: string;
        version?: string;
    }

    class RenderError extends Error {
        constructor(message: string, originalError: Error);

        originalError: Error;

    }

    interface RenderState {
        pending: any;
        restore: any;
    }

    type SearchMode = boolean | "toggle";

    interface SetStateFn<S> {
        (newState: S | (($: S)=>S)): void;
    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Sheet {
        constructor();

        /**
         * Destroys the sheet and removes it from the the DOM.
         */
        destroy(): void;

        id: string;

        model: string;

        navigation: stardust.Navigation;

    }

    interface SheetElement extends HTMLElement {
        className: "njs-sheet";
    }

    class Theme {
        constructor();

        /**
         * Resolve a color object using the color picker palette from the provided JSON theme.
         * @param c
         */
        getColorPickerColor(c: {
            color?: string;
            index?: number;
        }): string;

        /**
         * Get the best contrasting color against the specified `color`.
         * This is typically used to find a suitable text color for a label placed on an arbitrarily colored background.
         * 
         * The returned colors are derived from the theme.
         * @param color A color to measure the contrast against
         */
        getContrastingColorTo(color: string): string;

        getDataColorPalettes(): stardust.Theme.DataPalette[];

        getDataColorPickerPalettes(): stardust.Theme.ColorPickerPalette[];

        getDataColorScales(): stardust.Theme.ScalePalette[];

        getDataColorSpecials(): stardust.Theme.DataColorSpecials;

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

        /**
         * Returns theme name
         */
        name(): string;

    }

    namespace Theme {
        interface ColorPickerPalette {
            colors: string[];
            key: string;
        }

        interface DataColorSpecials {
            nil: string;
            others: string;
            primary: string;
        }

        interface DataPalette {
            colors: string[] | (string[])[];
            key: string;
            type: "pyramid" | "row";
        }

        interface ScalePalette {
            colors: string[] | (string[])[];
            key: string;
            type: "gradient" | "class-pyramid";
        }

    }

    interface ThemeInfo {
        id: string;
        /**
         * A function that should return a Promise that resolves to a raw JSON theme.
         */
        load(): Promise<stardust.ThemeJSON>;
    }

    type ThemeJSON = any;

    type ToolbarMode = "attach" | "detach" | "auto";

    class Translator {
        constructor();

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

        /**
         * Returns current locale.
         * @param lang language Locale to updated the currentLocale value
         */
        language(lang?: string): string;

    }

    interface TypeInfo {
        load: stardust.LoadType;
        name: string;
        meta?: object;
        version?: string;
    }

    /**
     * The entry point for defining a visualization.
     */
    interface Visualization {
        (galaxy: stardust.Galaxy): stardust.VisualizationDefinition;
    }

    interface VisualizationDefinition {
        component(): void;
        qae: stardust.QAEDefinition;
    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Viz {
        constructor();

        /**
         * Listens to custom events from inside the visualization. See useEmitter
         * @param eventName Event name to listen to
         * @param listener Callback function to invoke
         */
        addListener(eventName: string, listener: ()=>void): void;

        /**
         * Converts the visualization to a different registered type.
         * 
         * Will update properties if permissions allow, else will patch (can be forced with forcePatch parameter)
         * 
         * Not all chart types are compatible, similar structures are required.
         * @param newType Which registered type to convert to.
         * @param forceUpdate Whether to apply the change or not, else simply returns the resulting properties, defaults to true.
         * @param forcePatch Whether to always patch the change instead of making a permanent change
         */
        convertTo(newType: string, forceUpdate?: boolean, forcePatch?: boolean): Promise<object>;

        /**
         * Destroys the visualization and removes it from the the DOM.
         */
        destroy(): Promise<void>;

        /**
         * Gets the specific api that a Viz exposes.
         */
        getImperativeHandle(): Promise<object>;

        id: string;

        model: qix.GenericObject;

        /**
         * Removes a listener
         * @param eventName Event name to remove from
         * @param listener Callback function to remove
         */
        removeListener(eventName: string, listener: ()=>void): void;

        /**
         * Toggles the chart to a data view of the chart.
         * 
         * The chart will be toggled to the type defined in the nebula context (dataViewType).
         * 
         * The default dataViewType for nebula is sn-table. The specified chart type needs to be registered as well, in order to make it possible to render the data view.
         * @param showDataView If included, forces the chart into a specific state. True will show data view, and false will show the original chart. If not included it will always toggle between the two views.
         */
        toggleDataView(showDataView?: boolean): void;

        viewDataToggled: boolean;

    }

    interface VizElement extends HTMLElement {
        attributes: stardust.VizElementAttributes;
        className: "njs-viz";
    }

    interface VizElementAttributes extends NamedNodeMap {
        "data-render-count": string;
    }

}

