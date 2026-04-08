import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/Library/LibraryStudentDashboard.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=76b76fcf"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=76b76fcf"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const Suspense = __vite__cjsImport1_react["Suspense"];
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=76b76fcf";
import { Toaster } from "/node_modules/.vite/deps/react-hot-toast.js?v=76b76fcf";
const StudentRooms = React.lazy(_c = () => import("/src/components/library/student/StudentRooms.jsx"));
_c2 = StudentRooms;
const StudentChairBooking = React.lazy(_c3 = () => import("/src/components/library/student/StudentChairBooking.jsx"));
_c4 = StudentChairBooking;
const StudentBooks = React.lazy(_c5 = () => import("/src/components/library/student/StudentBooks.jsx?t=1775678617055"));
_c6 = StudentBooks;
const StudentMyBookings = React.lazy(_c7 = () => import("/src/components/library/student/StudentMyBookings.jsx"));
_c8 = StudentMyBookings;
class LibraryTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxDEV("div", { className: "bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm", children: "This section failed to load. Please switch tab or refresh the page." }, void 0, false, {
        fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
        lineNumber: 25,
        columnNumber: 9
      }, this);
    }
    return this.props.children;
  }
}
const TABS = [
  { id: "rooms", label: "ð  Private Rooms" },
  { id: "chairs", label: "ðº Chair Booking" },
  { id: "books", label: "ð Browse Books" },
  { id: "mybookings", label: "ð My Bookings", authRequired: true }
];
const LibraryStudentDashboard = () => {
  _s();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState(token ? "rooms" : "books");
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    localStorage.removeItem("user");
    user = {};
  }
  const isLoggedIn = Boolean(token);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-slate-50 text-slate-700", style: { fontFamily: '"Segoe UI", "Aptos", sans-serif' }, children: [
    /* @__PURE__ */ jsxDEV(Toaster, { position: "top-right" }, void 0, false, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 62,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: "bg-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-800", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "font-black text-lg tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("img", { src: "/sliit-official-logo.png", alt: "SLIIT Logo", className: "h-10 w-auto object-contain" }, void 0, false, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 68,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-white", children: "SLIIT Library" }, void 0, false, {
              fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
              lineNumber: 70,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-normal text-slate-400", children: "Student Portal" }, void 0, false, {
              fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
              lineNumber: 71,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 69,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
          lineNumber: 67,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-slate-400 hidden md:block", children: [
            "Welcome, ",
            /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-white", children: user.name || "Guest" }, void 0, false, {
              fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
              lineNumber: 76,
              columnNumber: 24
            }, this)
          ] }, void 0, true, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 75,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => navigate("/student-dashboard"),
              className: "px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all",
              children: "â Back to Portal"
            },
            void 0,
            false,
            {
              fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
              lineNumber: 78,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleLogout,
              className: "px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all",
              children: "Logout"
            },
            void 0,
            false,
            {
              fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
              lineNumber: 82,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
          lineNumber: 74,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
        lineNumber: 66,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto", children: TABS.map(
        (t) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setTab(t.id),
            disabled: t.authRequired && !isLoggedIn,
            className: `px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.id ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-cyan-400"}`,
            children: t.label
          },
          t.id,
          false,
          {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 92,
            columnNumber: 11
          },
          this
        )
      ) }, void 0, false, {
        fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
        lineNumber: 90,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 65,
      columnNumber: 7
    }, this),
    !isLoggedIn && /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 pt-4", children: /* @__PURE__ */ jsxDEV("div", { className: "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm", children: 'You are viewing as guest. Please log in to make bookings and view "My Bookings".' }, void 0, false, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 109,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 108,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { className: "max-w-7xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxDEV(LibraryTabErrorBoundary, { children: /* @__PURE__ */ jsxDEV(
      Suspense,
      {
        fallback: /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center items-center py-16", children: /* @__PURE__ */ jsxDEV("div", { className: "animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" }, void 0, false, {
          fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
          lineNumber: 121,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
          lineNumber: 120,
          columnNumber: 13
        }, this),
        children: [
          tab === "rooms" && /* @__PURE__ */ jsxDEV(StudentRooms, {}, void 0, false, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 125,
            columnNumber: 33
          }, this),
          tab === "chairs" && /* @__PURE__ */ jsxDEV(StudentChairBooking, {}, void 0, false, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 126,
            columnNumber: 34
          }, this),
          tab === "books" && /* @__PURE__ */ jsxDEV(StudentBooks, {}, void 0, false, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 127,
            columnNumber: 33
          }, this),
          tab === "mybookings" && /* @__PURE__ */ jsxDEV(StudentMyBookings, {}, void 0, false, {
            fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
            lineNumber: 128,
            columnNumber: 38
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
        lineNumber: 118,
        columnNumber: 11
      },
      this
    ) }, tab, false, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 117,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
      lineNumber: 116,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx",
    lineNumber: 61,
    columnNumber: 5
  }, this);
};
_s(LibraryStudentDashboard, "uN9D45bHq3x3hGGvg50uodLXQ+Y=", false, function() {
  return [useNavigate];
});
_c9 = LibraryStudentDashboard;
export default LibraryStudentDashboard;
var _c, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
$RefreshReg$(_c, "StudentRooms$React.lazy");
$RefreshReg$(_c2, "StudentRooms");
$RefreshReg$(_c3, "StudentChairBooking$React.lazy");
$RefreshReg$(_c4, "StudentChairBooking");
$RefreshReg$(_c5, "StudentBooks$React.lazy");
$RefreshReg$(_c6, "StudentBooks");
$RefreshReg$(_c7, "StudentMyBookings$React.lazy");
$RefreshReg$(_c8, "StudentMyBookings");
$RefreshReg$(_c9, "LibraryStudentDashboard");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "B:/smart-university-system/smart-university-system/frontend/src/pages/Library/LibraryStudentDashboard.jsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,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RSxLQUFBQyxLQUFBRSxLQUFBQyxLQUFBRSxLQUFBQyxLQUFBa0M7QUFBQSxhQUFBNUMsSUFBQTtBQUFBLGFBQUFDLEtBQUE7QUFBQSxhQUFBRSxLQUFBO0FBQUEsYUFBQUMsS0FBQTtBQUFBLGFBQUFFLEtBQUE7QUFBQSxhQUFBQyxLQUFBO0FBQUEsYUFBQUUsS0FBQTtBQUFBLGFBQUFDLEtBQUE7QUFBQSxhQUFBa0MsS0FBQSIsIm5hbWVzIjpbIlJlYWN0IiwidXNlU3RhdGUiLCJTdXNwZW5zZSIsInVzZU5hdmlnYXRlIiwiVG9hc3RlciIsIlN0dWRlbnRSb29tcyIsImxhenkiLCJfYyIsIl9jMiIsIlN0dWRlbnRDaGFpckJvb2tpbmciLCJfYzMiLCJfYzQiLCJTdHVkZW50Qm9va3MiLCJfYzUiLCJfYzYiLCJTdHVkZW50TXlCb29raW5ncyIsIl9jNyIsIl9jOCIsIkxpYnJhcnlUYWJFcnJvckJvdW5kYXJ5IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwiaGFzRXJyb3IiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJjb21wb25lbnREaWRDYXRjaCIsInJlbmRlciIsImNoaWxkcmVuIiwiVEFCUyIsImlkIiwibGFiZWwiLCJhdXRoUmVxdWlyZWQiLCJMaWJyYXJ5U3R1ZGVudERhc2hib2FyZCIsIl9zIiwibmF2aWdhdGUiLCJ0b2tlbiIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJ0YWIiLCJzZXRUYWIiLCJ1c2VyIiwiSlNPTiIsInBhcnNlIiwicmVtb3ZlSXRlbSIsImlzTG9nZ2VkSW4iLCJCb29sZWFuIiwiaGFuZGxlTG9nb3V0IiwiZm9udEZhbWlseSIsIm5hbWUiLCJtYXAiLCJ0IiwiX2M5Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIkxpYnJhcnlTdHVkZW50RGFzaGJvYXJkLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIFN1c3BlbnNlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xyXG5pbXBvcnQgeyBUb2FzdGVyIH0gZnJvbSAncmVhY3QtaG90LXRvYXN0JztcclxuXHJcbmNvbnN0IFN0dWRlbnRSb29tcyA9IFJlYWN0LmxhenkoKCkgPT4gaW1wb3J0KCcuLi8uLi9jb21wb25lbnRzL2xpYnJhcnkvc3R1ZGVudC9TdHVkZW50Um9vbXMnKSk7XHJcbmNvbnN0IFN0dWRlbnRDaGFpckJvb2tpbmcgPSBSZWFjdC5sYXp5KCgpID0+IGltcG9ydCgnLi4vLi4vY29tcG9uZW50cy9saWJyYXJ5L3N0dWRlbnQvU3R1ZGVudENoYWlyQm9va2luZycpKTtcclxuY29uc3QgU3R1ZGVudEJvb2tzID0gUmVhY3QubGF6eSgoKSA9PiBpbXBvcnQoJy4uLy4uL2NvbXBvbmVudHMvbGlicmFyeS9zdHVkZW50L1N0dWRlbnRCb29rcycpKTtcclxuY29uc3QgU3R1ZGVudE15Qm9va2luZ3MgPSBSZWFjdC5sYXp5KCgpID0+IGltcG9ydCgnLi4vLi4vY29tcG9uZW50cy9saWJyYXJ5L3N0dWRlbnQvU3R1ZGVudE15Qm9va2luZ3MnKSk7XHJcblxyXG5jbGFzcyBMaWJyYXJ5VGFiRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGUgPSB7IGhhc0Vycm9yOiBmYWxzZSB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcigpIHtcclxuICAgIHJldHVybiB7IGhhc0Vycm9yOiB0cnVlIH07XHJcbiAgfVxyXG5cclxuICBjb21wb25lbnREaWRDYXRjaCgpIHt9XHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlLmhhc0Vycm9yKSB7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1yZWQtNTAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIHRleHQtcmVkLTcwMCByb3VuZGVkLXhsIHB4LTQgcHktMyB0ZXh0LXNtXCI+XHJcbiAgICAgICAgICBUaGlzIHNlY3Rpb24gZmFpbGVkIHRvIGxvYWQuIFBsZWFzZSBzd2l0Y2ggdGFiIG9yIHJlZnJlc2ggdGhlIHBhZ2UuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IFRBQlMgPSBbXHJcbiAgeyBpZDogJ3Jvb21zJywgICAgICBsYWJlbDogJ/Cfj6AgUHJpdmF0ZSBSb29tcycgfSxcclxuICB7IGlkOiAnY2hhaXJzJywgICAgIGxhYmVsOiAn8J+SuiBDaGFpciBCb29raW5nJyB9LFxyXG4gIHsgaWQ6ICdib29rcycsICAgICAgbGFiZWw6ICfwn5OaIEJyb3dzZSBCb29rcycgIH0sXHJcbiAgeyBpZDogJ215Ym9va2luZ3MnLCBsYWJlbDogJ/Cfk4sgTXkgQm9va2luZ3MnLCBhdXRoUmVxdWlyZWQ6IHRydWUgfSxcclxuXTtcclxuXHJcbmNvbnN0IExpYnJhcnlTdHVkZW50RGFzaGJvYXJkID0gKCkgPT4ge1xyXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcclxuICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xyXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZSh0b2tlbiA/ICdyb29tcycgOiAnYm9va3MnKTtcclxuICBsZXQgdXNlciA9IHt9O1xyXG4gIHRyeSB7XHJcbiAgICB1c2VyID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcicpIHx8ICd7fScpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcclxuICAgIHVzZXIgPSB7fTtcclxuICB9XHJcbiAgY29uc3QgaXNMb2dnZWRJbiA9IEJvb2xlYW4odG9rZW4pO1xyXG5cclxuICBjb25zdCBoYW5kbGVMb2dvdXQgPSAoKSA9PiB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XHJcbiAgICBuYXZpZ2F0ZSgnL2xvZ2luJyk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNzAwXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ1wiU2Vnb2UgVUlcIiwgXCJBcHRvc1wiLCBzYW5zLXNlcmlmJyB9fT5cclxuICAgICAgPFRvYXN0ZXIgcG9zaXRpb249XCJ0b3AtcmlnaHRcIiAvPlxyXG5cclxuICAgICAgey8qIFRvcCBOYXYgKi99XHJcbiAgICAgIDxuYXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtOTAwIHN0aWNreSB0b3AtMCB6LTUwIHNoYWRvdy1zbSBib3JkZXItYiBib3JkZXItc2xhdGUtODAwXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy03eGwgbXgtYXV0byBweC00IHB5LTMgZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtM1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtbGcgdHJhY2tpbmctdGlnaHQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIvc2xpaXQtb2ZmaWNpYWwtbG9nby5wbmdcIiBhbHQ9XCJTTElJVCBMb2dvXCIgY2xhc3NOYW1lPVwiaC0xMCB3LWF1dG8gb2JqZWN0LWNvbnRhaW5cIiAvPlxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtd2hpdGVcIj5TTElJVCBMaWJyYXJ5PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ub3JtYWwgdGV4dC1zbGF0ZS00MDBcIj5TdHVkZW50IFBvcnRhbDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXNsYXRlLTQwMCBoaWRkZW4gbWQ6YmxvY2tcIj5cclxuICAgICAgICAgICAgICBXZWxjb21lLCA8c3BhbiBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkIHRleHQtd2hpdGVcIj57dXNlci5uYW1lIHx8ICdHdWVzdCd9PC9zcGFuPlxyXG4gICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gbmF2aWdhdGUoJy9zdHVkZW50LWRhc2hib2FyZCcpfVxyXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMiB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1jeWFuLTQwMCBob3ZlcjpiZy13aGl0ZS8xMCByb3VuZGVkLXhsIHRyYW5zaXRpb24tYWxsXCI+XHJcbiAgICAgICAgICAgICAg4oaQIEJhY2sgdG8gUG9ydGFsXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH1cclxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC0zIHB5LTIgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtY3lhbi00MDAgaG92ZXI6Ymctd2hpdGUvMTAgcm91bmRlZC14bCB0cmFuc2l0aW9uLWFsbFwiPlxyXG4gICAgICAgICAgICAgIExvZ291dFxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICB7LyogVGFiIEJhciAqL31cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTd4bCBteC1hdXRvIHB4LTQgZmxleCBnYXAtMSBvdmVyZmxvdy14LWF1dG9cIj5cclxuICAgICAgICAgIHtUQUJTLm1hcCh0ID0+IChcclxuICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgIGtleT17dC5pZH1cclxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIodC5pZCl9XHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3QuYXV0aFJlcXVpcmVkICYmICFpc0xvZ2dlZElufVxyXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTQgcHktMi41IHRleHQtc20gZm9udC1zZW1pYm9sZCB3aGl0ZXNwYWNlLW5vd3JhcCBib3JkZXItYi0yIHRyYW5zaXRpb24tYWxsICR7XHJcbiAgICAgICAgICAgICAgICB0YWIgPT09IHQuaWRcclxuICAgICAgICAgICAgICAgICAgICA/ICdib3JkZXItYWNjZW50IHRleHQtYWNjZW50J1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2JvcmRlci10cmFuc3BhcmVudCB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWN5YW4tNDAwJ1xyXG4gICAgICAgICAgICAgIH1gfT5cclxuICAgICAgICAgICAgICB7dC5sYWJlbH1cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICApKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9uYXY+XHJcblxyXG4gICAgICB7IWlzTG9nZ2VkSW4gJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctN3hsIG14LWF1dG8gcHgtNCBwdC00XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWFtYmVyLTUwIGJvcmRlciBib3JkZXItYW1iZXItMjAwIHRleHQtYW1iZXItODAwIHJvdW5kZWQteGwgcHgtNCBweS0zIHRleHQtc21cIj5cclxuICAgICAgICAgICAgWW91IGFyZSB2aWV3aW5nIGFzIGd1ZXN0LiBQbGVhc2UgbG9nIGluIHRvIG1ha2UgYm9va2luZ3MgYW5kIHZpZXcgXCJNeSBCb29raW5nc1wiLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogQ29udGVudCAqL31cclxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwibWF4LXctN3hsIG14LWF1dG8gcHgtNCBweS02XCI+XHJcbiAgICAgICAgPExpYnJhcnlUYWJFcnJvckJvdW5kYXJ5IGtleT17dGFifT5cclxuICAgICAgICAgIDxTdXNwZW5zZVxyXG4gICAgICAgICAgICBmYWxsYmFjaz17XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBweS0xNlwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gaC0xMCB3LTEwIHJvdW5kZWQtZnVsbCBib3JkZXItNCBib3JkZXItaW5kaWdvLTYwMCBib3JkZXItdC10cmFuc3BhcmVudFwiIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAge3RhYiA9PT0gJ3Jvb21zJyAgICAgICYmIDxTdHVkZW50Um9vbXMgLz59XHJcbiAgICAgICAgICAgIHt0YWIgPT09ICdjaGFpcnMnICAgICAmJiA8U3R1ZGVudENoYWlyQm9va2luZyAvPn1cclxuICAgICAgICAgICAge3RhYiA9PT0gJ2Jvb2tzJyAgICAgICYmIDxTdHVkZW50Qm9va3MgLz59XHJcbiAgICAgICAgICAgIHt0YWIgPT09ICdteWJvb2tpbmdzJyAmJiA8U3R1ZGVudE15Qm9va2luZ3MgLz59XHJcbiAgICAgICAgICA8L1N1c3BlbnNlPlxyXG4gICAgICAgIDwvTGlicmFyeVRhYkVycm9yQm91bmRhcnk+XHJcbiAgICAgIDwvbWFpbj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMaWJyYXJ5U3R1ZGVudERhc2hib2FyZDsiXSwiZmlsZSI6IkI6L3NtYXJ0LXVuaXZlcnNpdHktc3lzdGVtL3NtYXJ0LXVuaXZlcnNpdHktc3lzdGVtL2Zyb250ZW5kL3NyYy9wYWdlcy9MaWJyYXJ5L0xpYnJhcnlTdHVkZW50RGFzaGJvYXJkLmpzeCJ9
