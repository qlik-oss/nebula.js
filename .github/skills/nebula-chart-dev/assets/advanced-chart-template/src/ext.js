export default function ext(galaxy) {
  const inSense = Boolean(galaxy?.anything?.sense);

  return {
    support: {
      export: true,
      exportData: true,
    },
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        data: {
          uses: 'data',
        },
        settings: {
          uses: 'settings',
        },
        appearance: {
          component: 'expandable-items',
          label: 'Template appearance',
          items: {
            textHeader: {
              type: 'items',
              label: 'Text',
              items: {
                titleText: {
                  ref: 'props.titleText',
                  type: 'string',
                  label: 'Title',
                  expression: 'optional',
                },
                showSubtitle: {
                  ref: 'props.showSubtitle',
                  type: 'boolean',
                  component: 'switch',
                  label: 'Show subtitle',
                  defaultValue: true,
                },
              },
            },
            colorHeader: {
              type: 'items',
              label: 'Color',
              items: {
                accent: {
                  ref: 'props.accent',
                  component: 'color-picker',
                  label: 'Accent color',
                  defaultValue: { color: '#1a73e8' },
                },
              },
            },
            senseOnlyInfo: {
              component: 'text',
              label: inSense ? 'Running in Qlik Sense' : 'Not running in Qlik Sense (local or mashup environment)',
            },
          },
        },
      },
    },
  };
}
