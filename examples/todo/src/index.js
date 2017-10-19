import React from 'react' ;
import { render } from 'react-dom' ;
import { Provider } from 'react-redux' ;
import { createDevTools } from 'redux-devtools' ;
import DockMonitor from 'redux-devtools-dock-monitor' ;
import LogMonitor from 'redux-devtools-log-monitor' ;
import { applyMiddleware, compose } from 'redux' ;
import thunk from 'redux-thunk' ;

import { createInjector, createStore } from 'reslice' ;
import { bindTestSlice } from 'reslice/lib/tests' ;
import { reducer } from './ducks' ;
import App from './app' ;

const DevTools = createDevTools(
        <DockMonitor
            toggleVisibilityKey='ctrl-b'
            changePositionKey='ctrl-q'
            changeMonitorKey='ctrl-m'
            defaultIsVisible={ true }
            defaultSize={ 0.2 }
            >
            <LogMonitor theme='tomorrow' />
        </DockMonitor>
        ) ;

/**
 * Enhance store with the reduct-thunk middleware and the devtools
 * instrumentation. Create the store (this is the reslice version)
 * and create an injector component from App which pushes the top
 * level of the store into App as its slice of the store.
**/
const enhancer = compose(applyMiddleware(thunk), DevTools.instrument()) ;
const store = createStore(reducer, {}, (r) => r, enhancer) ;
const Injector = createInjector(App) ;

render(
    <Provider store={store}>
      <div>
        <Injector />
        <DevTools />
      </div>
    </Provider>,
    document.getElementById('root')
    ) ;
