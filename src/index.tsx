import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Auth from './components/Auth';
import Home from './pages/Home';
import DialogueMapper from './components/DialogueMapper';
import Settings from './components/Settings';
import Backstreet from './pages/Backstreet';
import Cursor from './components/Cursor';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const currentKey = window.location.pathname.split('/')[1] || '/';
const timeout = { enter: 300, exit: 200 };

root.render(
    <>
        <Helmet>
            <title>pet game</title>
            <meta charSet="utf-8" />
            <link rel="canonical" href="http://willfarhat.com" />
        </Helmet>
        <Settings>
            <Auth>
                <Cursor />
                <DialogueMapper>
                    <BrowserRouter>
                        <TransitionGroup component="main" className="page-main">
                            <CSSTransition
                                key={currentKey}
                                timeout={timeout}
                                classNames="fade"
                                appear
                            >
                                <section className="page-main-inner">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route
                                            path="*"
                                            element={<Backstreet />}
                                        />
                                    </Routes>
                                </section>
                            </CSSTransition>
                        </TransitionGroup>
                    </BrowserRouter>
                </DialogueMapper>
            </Auth>
        </Settings>
    </>
);

reportWebVitals();
