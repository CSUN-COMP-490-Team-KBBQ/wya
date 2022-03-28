// import React from 'react';
// import Image from 'react-bootstrap/Image';
// import { Link, useHistory } from 'react-router-dom';

// import logo from '../../assets/wya-logo.png';
// import { useUserContext } from '../../contexts/UserContext';
// import './LandingPage.css';

// const LandingPage: React.FC = () => {
//   const history = useHistory();
//   const { user } = useUserContext();

//   React.useEffect(() => {
//     if (user) {
//       history.push('/calendar');
//     }
//   });

//   return (
//     <div className="home-page-content">
//       <h1>
//         Welcome!{' '}
//         <Link to="/login" className="loginLink">
//           Login
//         </Link>{' '}
//         to get started.{' '}
//       </h1>
//       <Image
//         src={logo}
//         fluid
//         style={{
//           height: '200px',
//           float: 'right',
//           marginRight: '100px',
//         }}
//       />
//       <h2>
//         wya? is a web-based application that will help you, your friends, or
//         your family meet up without the headache of planning. We are creating a
//         system to easily make plans by stacking personal schedules so that your
//         group will be able to clearly see who&apos;s doing what and when. The
//         add-a-friend feature and overall simplicity of wya? removes the need for
//         multiple apps and lets you chat, plan, and invite whomever you&apos;d
//         like.
//       </h2>
//       <h1>Our app removes all the stress when planning all the fun!</h1>
//     </div>
//   );
// };

// export default LandingPage;

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import logo from '../../assets/wya-logo.png';
import image from '../../assets/background9.png';
import LoginForm from '../../components/LoginForm/LoginForm';
import PublicPage from '../../components/PublicPage/PublicPage';

// const navigation = [
//   { name: 'Product', href: '#' },
//   { name: 'Features', href: '#' },
//   { name: 'Marketplace', href: '#' },
//   { name: 'Company', href: '#' },
// ];

export default function LandingPage() {
  return (
    <>
      <PublicPage>
        <div className="sm:text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Data to enrich your</span>{' '}
            <span className="block text-blue-600 xl:inline">scheduling</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            wya? is a web-based application that will help you, your friends, or
            your family meet up without the headache of planning. We are
            creating a system to easily make plans by stacking personal
            schedules so that your group will be able to clearly see who&apos;s
            doing what and when. The add-a-friend feature and overall simplicity
            of wya? removes the need for multiple apps and lets you chat, plan,
            and invite whomever you&apos;d like.
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <div className="rounded-md shadow">
              <a
                href="#"
                className="no-underline w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
        <svg
          className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
          fill="currentColor"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="50,0 100,0 50,100 0,100" />
        </svg>
      </PublicPage>

      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          // src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          src={image}
          alt=""
        />
      </div>
    </>
    // <div className="relative bg-white overflow-hidden">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
    //       <svg
    //         className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
    //         fill="currentColor"
    //         viewBox="0 0 100 100"
    //         preserveAspectRatio="none"
    //         aria-hidden="true"
    //       >
    //         <polygon points="50,0 100,0 50,100 0,100" />
    //       </svg>

    //       <Popover>
    //         <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
    //           <nav
    //             className="relative flex items-center justify-between sm:h-10 lg:justify-start"
    //             aria-label="Global"
    //           >
    //             <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
    //               <div className="flex items-center justify-between w-full md:w-auto">
    //                 <a href="#">
    //                   {/* <span className="sr-only">Workflow</span> */}
    //                   <img className="h-8 w-auto sm:h-10" src={logo} />
    //                 </a>
    //               </div>
    //             </div>
    //           </nav>
    //         </div>
    //       </Popover>

    //       <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
    //         <div className="sm:text-center lg:text-left">
    //           <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
    //             <span className="block xl:inline">Data to enrich your</span>{' '}
    //             <span className="block text-indigo-600 xl:inline">
    //               online business
    //             </span>
    //           </h1>
    //           <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
    //             wya? is a web-based application that will help you, your
    //             friends, or your family meet up without the headache of
    //             planning. We are creating a system to easily make plans by
    //             stacking personal schedules so that your group will be able to
    //             clearly see who&apos;s doing what and when. The add-a-friend
    //             feature and overall simplicity of wya? removes the need for
    //             multiple apps and lets you chat, plan, and invite whomever
    //             you&apos;d like.
    //           </p>
    //           <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
    //             <div className="rounded-md shadow">
    //               <a
    //                 href="#"
    //                 className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
    //               >
    //                 Get started
    //               </a>
    //             </div>
    //           </div>
    //         </div>
    //       </main>
    //     </div>
    //   </div>
    //   <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
    //     <img
    //       className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
    //       src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
    //       // src={image}
    //       alt=""
    //     />
    //   </div>
    // </div>
  );
}
