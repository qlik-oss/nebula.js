import React from 'react';

const constrainElement = (el, d) => {
  /* eslint-disable no-param-reassign */
  if (d) {
    el.style.width = `${d.width}px`;
    el.style.height = `${d.height}px`;
    el.style.top = `${d.top}px`;
    el.style.left = `${d.left}px`;
  } else {
    el.style.width = undefined;
    el.style.height = undefined;
    el.style.top = 0;
    el.style.left = 0;
    el.style.right = 0;
    el.style.bottom = 0;
  }
  /* eslint-enable no-param-reassign */
};

const scheduleRender = (props, prev, initial, contentElement) => {
  if (prev) {
    prev.reject();
  }
  const prom = {};

  const p = new Promise(resolve => {
    const timeout = setTimeout(() => {
      const parentRect = contentElement.parentElement.parentElement.getBoundingClientRect();
      const r =
        typeof props.snContext.logicalSize === 'function'
          ? props.snContext.logicalSize(props.layout, props.sn)
          : props.sn.logicalSize({ layout: props.layout });
      const logicalSize = r || undefined;
      if (r) {
        // const rect = that.element.getBoundingClientRect();

        const parentRatio = parentRect.width / parentRect.height;
        const rRatio = r.width / r.height;

        let width;
        let height;
        let left = 0;
        let top = 0;

        if (parentRatio > rRatio) {
          // parent is wider -> limit height
          ({ height } = parentRect);
          width = height * rRatio;
          left = (parentRect.width - width) / 2;
          top = 0;
        } else {
          ({ width } = parentRect);
          height = width / rRatio;
          left = 0;
          top = (parentRect.height - height) / 2;
        }

        constrainElement(contentElement, {
          top,
          left,
          width,
          height,
        });
      } else {
        constrainElement(contentElement);
      }

      initial.mount();

      Promise.resolve(
        props.sn.component.render({
          layout: props.layout,
          options: props.snOptions || {},
          context: {
            permissions: (props.snContext || {}).permissions,
            theme: (props.snContext || {}).theme,
            rtl: (props.snContext || {}).rtl,
            localeInfo: (props.snContext || {}).localeInfo,
            logicalSize,
          },
        })
      )
        .then(() => {
          initial.rendered();
          // props.sn.component.didUpdate(); // TODO - should check if component is in update stage
        })
        .then(resolve);
    }, 0);

    prom.reject = () => {
      clearTimeout(timeout);
      resolve();
    };
  });

  prom.then = p.then;

  return prom;
};

class Supernova extends React.Component {
  constructor(props) {
    super(props);
    this.initial = {
      mount: () => {
        this.props.sn.component.created({
          options: this.props.snOptions,
          context: this.props.snContext,
        });
        this.props.sn.component.mounted(this.contentElement);
        this.initial.mount = () => {};
      },
      rendered: () => {
        if (this.props.snOptions && typeof this.props.snOptions.onInitialRender === 'function') {
          this.props.snOptions.onInitialRender.call(null);
        }
        this.initial.rendered = () => {};
      },
    };
  }

  componentDidMount() {
    let resizeObserver;

    this.dimensions = this.element.getBoundingClientRect();

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        const dims = this.element.getBoundingClientRect();
        if (dims.width !== this.dimensions.width || dims.height !== this.dimensions.height) {
          this.dimensions = dims;
          this.setState({});
        }
      });
      resizeObserver.observe(this.element);
    }

    this.onUnmount = () => {
      this.onUnmount = null;
      if (resizeObserver) {
        resizeObserver.unobserve(this.element);
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      this.props.sn.component.willUnmount();
      if (this.next) {
        this.next.reject();
      }
    };

    this.next = scheduleRender(
      {
        snOptions: this.props.snOptions,
        snContext: this.props.snContext,
        sn: this.props.sn,
        layout: this.props.layout,
      },
      this.next,
      this.initial,
      this.contentElement
    );
  }

  shouldComponentUpdate(nextProps) {
    const update =
      nextProps.sn &&
      !(nextProps.layout && nextProps.layout.qSelectionInfo && nextProps.layout.qSelectionInfo.qInSelections);
    if (!update) {
      return false;
    }

    return true;

    // const should = nextProps.sn.component.shouldUpdate({
    //   layout: nextProps.layout,
    //   options: {},
    // });

    // return should;
  }

  componentDidUpdate() {
    this.next = scheduleRender(this.props, this.next, this.initial, this.contentElement);
  }

  componentWillUnmount() {
    this.onUnmount();
  }

  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    };
    return (
      <div
        style={style}
        ref={element => {
          this.element = element;
        }}
      >
        <div
          style={{
            position: 'absolute',
          }}
          ref={element => {
            this.contentElement = element;
          }}
        />
      </div>
    );
  }
}

export default Supernova;
