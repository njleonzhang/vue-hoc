import test from 'ava';
import sinon from 'sinon';
import {mount} from 'vuenit';
import {createHOC, createHOCc, createRenderFn, createRenderFnc} from '../dist';

const Component = {
  props : ['propA', 'propB'],
  template: `<ul>
    <li>{{propA}}</li>
    <li>{{propB}}</li>
  </ul>`
};

mount(Component);

test('props filter through hoc into component', t => {
  const enhance = createHOCc({
  });
  const enhanced = enhance(Component);

  const vm = mount(enhanced, {
    props : {
      propA : 'foo',
      propB: 'bah',
    }
  });

  const expected = '<ul><li>foo</li><li>bah</li></ul>';

  t.is(vm.$html, expected);
});

test('can overwrite prop values', t => {
  const enhance = createHOCc({
    render : createRenderFnc({
      props : {
        propA : 'bah',
        propB : 'foo'
      }
    })
  }, null);
  const enhanced = enhance(Component);

  const vm = mount(enhanced, {
    props : {
      propA : 'foo',
      propB: 'bah',
    }
  });

  const expected = '<ul><li>bah</li><li>foo</li></ul>';

  t.is(vm.$html, expected);
});

test('can amend prop values with a function', t => {
  const enhance = createHOCc({
    render: createRenderFnc({
      props(props){
        return {
          propA : this.$props.propB,
          propB : props.propA,
        };
      }
    })
  }, null);
  const enhanced = enhance(Component);

  const vm = mount(enhanced, {
    props : {
      propA : 'foo',
      propB: 'bah',
    }
  });

  const expected = '<ul><li>bah</li><li>foo</li></ul>';

  t.is(vm.$html, expected);
});

test('can add additional props', t => {
  const enhance = createHOCc({
    props : ['propB', 'propC'],
    render : createRenderFnc({
      props(props){
        t.is(Object.hasOwnProperty.call(props, 'propA'), true);
        t.is(Object.hasOwnProperty.call(props, 'propB'), true);
        return {
          propA : props.propC[0],
          propB : props.propC[1]
        };
      }
    })
  }, null);
  const enhanced = enhance(Component);

  const vm = mount(enhanced, {
    props : {
      propA : 'foo',
      propB : 'bah',
      propC : ['abc', 'def']
    }
  });

  const expected = '<ul><li>abc</li><li>def</li></ul>';

  t.is(vm.$html, expected);
});

test('can pass props through multiple hocs', t => {
  const hoc1 = createHOCc({}, {})(Component);
  const hoc2 = createHOCc({}, {})(hoc1);

  const vm = mount(hoc2, {
    props : {
      propA : 'foo',
      propB : 'bah',
    }
  });

  const expected = '<ul><li>foo</li><li>bah</li></ul>';

  t.is(vm.$html, expected);
});
