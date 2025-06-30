import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {Snippet} from '../../snippets/api/snippet';
import {SnippetComponent} from '../../snippets/component/snippet.component';
import {DbResult} from '@kb-rest/shared';
import {SearchComponent} from '../../../components/search/search.component';
import {Folder} from '../../sidenav/api/folder';
import {NgxMasonryModule} from 'ngx-masonry';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LMarkdownEditorModule, SnippetComponent, SearchComponent, NgxMasonryModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnChanges, AfterViewInit {

  addSnippet: boolean;
  editingSnippet: Snippet;
  newSnippetTitle: string;
  newSnippetContent: string;
  newSnippetPublic = false;
  currentSearch = '';
  loadingSnippets = true;

  public masonryOptions = {
    animations: {}
  };

  /** Whether the user has folders*/
  @Input()
  hasFolders = false;

  @Input()
  loading = false;

  @Input()
  hasMore = true;

  @Output()
  loadMore = new EventEmitter<void>();

  @Input()
  selectedSnippetId: number;

  @ViewChild('scrollSentinel')
  scrollSentinel: ElementRef;

  @Input()
  snippets: Snippet[];

  @Input()
  updateResult: DbResult;

  @Input()
  currentFolder: Folder;

  @Input()
  communityUser: number;

  @Output()
  newSnippet = new EventEmitter<Partial<Snippet>>();

  @Output() editSnippet = new EventEmitter<Snippet>();

  @Output() deleteSnippet = new EventEmitter<Snippet>();

  @Output() togglePublic = new EventEmitter<Snippet>();

  @Output() pinSnippet = new EventEmitter<Snippet>();

  @Output() search = new EventEmitter<string>();

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    if (this.scrollSentinel?.nativeElement) {
      let ignoreFirstIntersection = false;//2 api calls when only a few snippets (page not full)
      const observer = new IntersectionObserver(
        (entries) => {
          const lastEntry = entries[entries.length - 1];
          if (lastEntry.isIntersecting && this.hasMore && !this.loading) {
            if(ignoreFirstIntersection){
              ignoreFirstIntersection = false;
              return;
            }
            this.loading = true;
            this.loadMore.emit();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['updateResult']?.currentValue) {
      const result: DbResult = changes['updateResult'].currentValue as DbResult;
      if(result.success){
        this.resetState();
      }
      if(!result.success){
        console.warn('Update result has success=false');
      }
    }
    if(changes['snippets'] && !changes['snippets']?.firstChange){
      this.loadingSnippets = false;
    }
    if(
      changes['currentFolder'] && changes['currentFolder'].previousValue
      && changes['currentFolder'].previousValue?.id != changes['currentFolder'].currentValue?.id){
      this.loadingSnippets = true;
    }
  }

  saveSnippet() {
    this.newSnippet.emit({
      title: this.newSnippetTitle,
      content: this.newSnippetContent,
      public: this.newSnippetPublic,
    });
  }

  resetState() {
    this.addSnippet = false;
    this.editingSnippet = null;
    this.newSnippetTitle = '';
    this.newSnippetContent = '';
    this.newSnippetPublic = false;
  }

  startEditingSnippet(snippet: Snippet) {
    this.editingSnippet = {...snippet};
    this.newSnippetContent = snippet.content;
    this.newSnippetTitle = snippet.title;
    this.newSnippetPublic = Boolean(snippet.public);
  }

  doEditSnippet() {
    this.editSnippet.emit({
      ...this.editingSnippet,
      title: this.newSnippetTitle,
      content: this.newSnippetContent,
      public: this.newSnippetPublic,
    })
  }

  searchSnippets(search: string) {
    this.search.emit(search);
    this.currentSearch = search;
  }

}
